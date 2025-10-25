import type { Request } from 'express';

interface SecurityEvent {
  timestamp: Date;
  type: 'AUTH_FAILURE' | 'RATE_LIMIT' | 'INVALID_INPUT' | 'PAYMENT_ATTEMPT' | 'CODE_EXECUTION' | 'PREMIUM_ACCESS';
  userId?: string;
  ip: string;
  userAgent: string;
  details: any;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

class SecurityLogger {
  private events: SecurityEvent[] = [];
  private readonly MAX_EVENTS = 10000;

  /**
   * Log security events with automatic severity assessment
   */
  logSecurityEvent(req: Request, type: SecurityEvent['type'], details: any, severity?: SecurityEvent['severity']) {
    const event: SecurityEvent = {
      timestamp: new Date(),
      type,
      userId: (req as any).user?.claims?.sub,
      ip: req.ip || req.connection.remoteAddress || 'unknown',
      userAgent: req.get('User-Agent') || 'unknown',
      details,
      severity: severity || this.assessSeverity(type, details)
    };

    this.events.push(event);

    // Keep only recent events to prevent memory issues
    if (this.events.length > this.MAX_EVENTS) {
      this.events = this.events.slice(-this.MAX_EVENTS);
    }

    // Log to console for immediate visibility
    const logLevel = this.getLogLevel(event.severity);
    console[logLevel](`[SECURITY] ${event.type}:`, {
      timestamp: event.timestamp.toISOString(),
      userId: event.userId || 'anonymous',
      ip: event.ip,
      details: event.details
    });

    // Check for suspicious patterns
    this.detectSuspiciousActivity(event);
  }

  /**
   * Assess event severity based on type and context
   */
  private assessSeverity(type: SecurityEvent['type'], details: any): SecurityEvent['severity'] {
    switch (type) {
      case 'AUTH_FAILURE':
        return details.consecutiveFailures > 3 ? 'HIGH' : 'MEDIUM';
      case 'RATE_LIMIT':
        return details.exceedCount > 5 ? 'HIGH' : 'MEDIUM';
      case 'INVALID_INPUT':
        return details.potentialAttack ? 'HIGH' : 'LOW';
      case 'PAYMENT_ATTEMPT':
        return details.suspicious ? 'CRITICAL' : 'LOW';
      case 'CODE_EXECUTION':
        return details.dangerous ? 'CRITICAL' : 'LOW';
      case 'PREMIUM_ACCESS':
        return details.unauthorized ? 'HIGH' : 'LOW';
      default:
        return 'MEDIUM';
    }
  }

  /**
   * Get appropriate console log level
   */
  private getLogLevel(severity: SecurityEvent['severity']): 'log' | 'warn' | 'error' {
    switch (severity) {
      case 'LOW': return 'log';
      case 'MEDIUM': return 'warn';
      case 'HIGH':
      case 'CRITICAL': return 'error';
      default: return 'log';
    }
  }

  /**
   * Detect suspicious activity patterns
   */
  private detectSuspiciousActivity(event: SecurityEvent) {
    const recentEvents = this.getRecentEvents(event.ip, 15 * 60 * 1000); // Last 15 minutes

    // Check for multiple auth failures
    const authFailures = recentEvents.filter(e => e.type === 'AUTH_FAILURE').length;
    if (authFailures >= 5) {
      this.alertSuspiciousActivity('Multiple authentication failures', event.ip, { authFailures });
    }

    // Check for rate limit violations
    const rateLimitHits = recentEvents.filter(e => e.type === 'RATE_LIMIT').length;
    if (rateLimitHits >= 3) {
      this.alertSuspiciousActivity('Repeated rate limit violations', event.ip, { rateLimitHits });
    }

    // Check for dangerous code execution attempts
    const dangerousCode = recentEvents.filter(e => 
      e.type === 'CODE_EXECUTION' && e.details.dangerous
    ).length;
    if (dangerousCode >= 1) {
      this.alertSuspiciousActivity('Dangerous code execution attempt', event.ip, { dangerousCode });
    }
  }

  /**
   * Get recent events for an IP address
   */
  private getRecentEvents(ip: string, timeWindowMs: number): SecurityEvent[] {
    const cutoff = new Date(Date.now() - timeWindowMs);
    return this.events.filter(event => 
      event.ip === ip && event.timestamp > cutoff
    );
  }

  /**
   * Alert about suspicious activity
   */
  private alertSuspiciousActivity(reason: string, ip: string, details: any) {
    console.error(`[SECURITY ALERT] ${reason}`, {
      ip,
      timestamp: new Date().toISOString(),
      details
    });

    // In production, this would send alerts to monitoring systems
    // For now, we'll just log prominently
  }

  /**
   * Get security summary for monitoring
   */
  getSecuritySummary(timeWindowMs: number = 60 * 60 * 1000): any {
    const cutoff = new Date(Date.now() - timeWindowMs);
    const recentEvents = this.events.filter(event => event.timestamp > cutoff);

    const summary = {
      totalEvents: recentEvents.length,
      byType: {} as Record<string, number>,
      bySeverity: {} as Record<string, number>,
      topIPs: {} as Record<string, number>,
      criticalEvents: recentEvents.filter(e => e.severity === 'CRITICAL').length
    };

    recentEvents.forEach(event => {
      // Count by type
      summary.byType[event.type] = (summary.byType[event.type] || 0) + 1;
      
      // Count by severity
      summary.bySeverity[event.severity] = (summary.bySeverity[event.severity] || 0) + 1;
      
      // Count by IP
      summary.topIPs[event.ip] = (summary.topIPs[event.ip] || 0) + 1;
    });

    return summary;
  }

  /**
   * Get all events for admin review
   */
  getAllEvents(limit: number = 100): SecurityEvent[] {
    return this.events
      .slice(-limit)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }
}

export const securityLogger = new SecurityLogger();