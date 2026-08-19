/** Runtime CSP for Emerge v0.1. Single source of truth — vercel.json and tests import this. */
export const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
  "form-action 'self' https://wa.me",
].join("; ");

export const CSP_ALLOWED_SCRIPT_TOKENS = ["'self'", "'unsafe-inline'"] as const;
