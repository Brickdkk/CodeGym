import crypto from 'crypto';
import type { Request, Response, NextFunction } from 'express';

/**
 * Verify MercadoPago webhook signature
 */
export function verifyMercadoPagoWebhook(req: Request, res: Response, next: NextFunction) {
  const signature = req.headers['x-signature'] as string;
  const requestId = req.headers['x-request-id'] as string;
  
  if (!signature || !requestId) {
    return res.status(400).json({ error: 'Missing webhook verification headers' });
  }

  // Extract signature parts
  const parts = signature.split(',');
  let ts: string | undefined;
  let hash: string | undefined;

  for (const part of parts) {
    const [key, value] = part.split('=');
    if (key === 'ts') ts = value;
    if (key === 'v1') hash = value;
  }

  if (!ts || !hash) {
    return res.status(400).json({ error: 'Invalid signature format' });
  }

  // Create expected signature
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET || 'your-webhook-secret';
  const manifest = `id:${requestId};request-id:${requestId};ts:${ts};`;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(manifest)
    .digest('hex');

  if (expectedSignature !== hash) {
    return res.status(401).json({ error: 'Invalid webhook signature' });
  }

  next();
}

/**
 * Validate payment amount on server side
 */
export function validatePaymentAmount(req: Request, res: Response, next: NextFunction) {
  const { amount, currency } = req.body;

  // Define valid amounts (prevent frontend manipulation)
  const VALID_AMOUNTS = {
    premium_monthly: 4990, // CLP
    premium_yearly: 49900  // CLP (with discount)
  };

  if (!amount || !currency) {
    return res.status(400).json({ error: 'Amount and currency are required' });
  }

  if (currency !== 'CLP') {
    return res.status(400).json({ error: 'Only CLP currency is supported' });
  }

  const validAmounts = Object.values(VALID_AMOUNTS);
  if (!validAmounts.includes(amount)) {
    return res.status(400).json({ 
      error: 'Invalid payment amount',
      validAmounts: VALID_AMOUNTS
    });
  }

  next();
}

/**
 * Secure premium feature access validation
 */
export function validatePremiumAccess(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user;
  
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // Check if user has active premium subscription
  // This should be validated against database, not frontend claims
  const userId = user.claims?.sub;
  
  if (!userId) {
    return res.status(401).json({ error: 'Invalid user session' });
  }

  // TODO: Implement actual premium status check from database
  // For now, we'll continue to next middleware
  next();
}

/**
 * Prevent price manipulation in payment requests
 */
export function sanitizePaymentData(req: Request, res: Response, next: NextFunction) {
  // Remove any price-related fields from request body that shouldn't be there
  const allowedFields = ['paymentMethodId', 'email', 'description'];
  const sanitizedBody: any = {};

  for (const field of allowedFields) {
    if (req.body[field]) {
      sanitizedBody[field] = req.body[field];
    }
  }

  // Force server-side pricing
  sanitizedBody.amount = 4990; // Fixed premium price
  sanitizedBody.currency = 'CLP';
  
  req.body = sanitizedBody;
  next();
}