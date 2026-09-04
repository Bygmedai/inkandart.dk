/** Runtime CSP for Emerge v0.1. Single source of truth — vercel.json and tests import this. */
export const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https://avatars.githubusercontent.com https://cdn.shopify.com",
  "font-src 'self'",
  "connect-src 'self' https://oauth.bygmedai.dk https://api.github.com https://github.com",
  "object-src 'none'",
  // Book.dk ligger som ramme i /booking (PR #318). Uden frame-src falder
  // <iframe> tilbage paa default-src 'self' og browseren viser en tom
  // ramme — set paa preview'et 4/9. Kun Book.dk; frame-ancestors 'none'
  // handler om hvem der maa ramme OS ind og roeres ikke.
  "frame-src https://inkart.book.dk",
  "base-uri 'self'",
  "frame-ancestors 'none'",
  "form-action 'self' https://oauth.bygmedai.dk https://github.com",
].join("; ");

export const CSP_ALLOWED_SCRIPT_TOKENS = ["'self'", "'unsafe-inline'"] as const;
