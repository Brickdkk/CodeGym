import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "../shared/schema.js";
import ws from 'ws';

// Enable WebSocket support for Neon serverless driver
// (required for connection pooling in serverless environments)
neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Limit pool size: 1 connection per serverless instance to avoid exhausting Neon's connection slots
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: process.env.VERCEL ? 1 : 5,
});
export const db = drizzle(pool, { schema });
