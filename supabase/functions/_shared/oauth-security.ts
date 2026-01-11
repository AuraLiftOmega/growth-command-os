/**
 * OAuth 2.1 / BCP Security Module
 * 
 * Implements best practices:
 * - PKCE with S256 mandatory
 * - High-entropy state parameter
 * - Nonce for ID tokens
 * - Strict redirect URI validation
 * - Token security helpers
 */

// PKCE S256 - RFC 7636 compliant implementation
export async function generatePKCE(): Promise<{ verifier: string; challenge: string; method: 'S256' }> {
  // Generate 32-byte (256-bit) high-entropy verifier
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  
  // Base64url encode without padding (RFC 4648 Section 5)
  const verifier = base64urlEncode(array);
  
  // Generate S256 challenge: BASE64URL(SHA256(verifier))
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  const challenge = base64urlEncode(new Uint8Array(digest));
  
  return { verifier, challenge, method: 'S256' };
}

// Base64url encoding (RFC 4648 Section 5)
function base64urlEncode(buffer: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...buffer));
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// Generate high-entropy state parameter (256-bit)
export function generateState(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return base64urlEncode(array);
}

// Generate nonce for ID tokens
export function generateNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return base64urlEncode(array);
}

// Validate redirect URI (OAuth 2.1 BCP)
export function validateRedirectUri(uri: string, allowedDomains: string[]): { valid: boolean; error?: string } {
  try {
    const url = new URL(uri);
    
    // Must be HTTPS in production (except localhost for dev)
    if (url.protocol !== 'https:' && url.hostname !== 'localhost' && url.hostname !== '127.0.0.1') {
      return { valid: false, error: 'Redirect URI must use HTTPS' };
    }
    
    // No wildcards allowed
    if (uri.includes('*')) {
      return { valid: false, error: 'Wildcards not allowed in redirect URI' };
    }
    
    // No fragments allowed
    if (url.hash) {
      return { valid: false, error: 'Fragments not allowed in redirect URI' };
    }
    
    // Check against allowed domains (if specified)
    if (allowedDomains.length > 0) {
      const isAllowed = allowedDomains.some(domain => 
        url.hostname === domain || url.hostname.endsWith(`.${domain}`)
      );
      if (!isAllowed) {
        return { valid: false, error: 'Redirect URI domain not in allowed list' };
      }
    }
    
    return { valid: true };
  } catch {
    return { valid: false, error: 'Invalid redirect URI format' };
  }
}

// Rate limiter for token endpoints (in-memory, use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string, limit: number = 10, windowMs: number = 60000): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(key);
  
  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetIn: windowMs };
  }
  
  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, resetIn: entry.resetAt - now };
  }
  
  entry.count++;
  return { allowed: true, remaining: limit - entry.count, resetIn: entry.resetAt - now };
}

// Validate JWT ID token (basic validation)
export interface IdTokenClaims {
  iss: string;
  sub: string;
  aud: string | string[];
  exp: number;
  iat: number;
  nonce?: string;
  email?: string;
  name?: string;
}

export function validateIdTokenClaims(
  claims: IdTokenClaims,
  expectedIssuer: string,
  expectedAudience: string,
  expectedNonce?: string
): { valid: boolean; error?: string } {
  const now = Math.floor(Date.now() / 1000);
  
  // Validate issuer
  if (claims.iss !== expectedIssuer) {
    return { valid: false, error: `Invalid issuer: expected ${expectedIssuer}, got ${claims.iss}` };
  }
  
  // Validate audience
  const audiences = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
  if (!audiences.includes(expectedAudience)) {
    return { valid: false, error: 'Token audience mismatch' };
  }
  
  // Validate expiration (with 5 minute leeway)
  if (claims.exp < now - 300) {
    return { valid: false, error: 'Token expired' };
  }
  
  // Validate issued at (not in future)
  if (claims.iat > now + 60) {
    return { valid: false, error: 'Token issued in future' };
  }
  
  // Validate nonce if expected
  if (expectedNonce && claims.nonce !== expectedNonce) {
    return { valid: false, error: 'Nonce mismatch' };
  }
  
  return { valid: true };
}

// Scope validation
export function validateScopes(granted: string[], required: string[], separator: string = ' '): { valid: boolean; missing: string[] } {
  const grantedSet = new Set(granted.flatMap(s => s.split(separator)));
  const missing = required.filter(scope => !grantedSet.has(scope));
  return { valid: missing.length === 0, missing };
}

// State expiry validation
export function isStateExpired(expiresAt: string | Date, bufferSeconds: number = 30): boolean {
  const expiry = new Date(expiresAt);
  return Date.now() > expiry.getTime() - bufferSeconds * 1000;
}

// Token sanitizer (remove from logs)
export function sanitizeForLog(obj: Record<string, unknown>): Record<string, unknown> {
  const sensitiveKeys = ['access_token', 'refresh_token', 'id_token', 'code', 'code_verifier', 'client_secret'];
  const result: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (sensitiveKeys.includes(key.toLowerCase())) {
      result[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      result[key] = sanitizeForLog(value as Record<string, unknown>);
    } else {
      result[key] = value;
    }
  }
  
  return result;
}

// CORS headers with stricter settings
export const secureCorsHeaders = {
  'Access-Control-Allow-Origin': '*', // In production, specify exact origin
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Cache-Control': 'no-store',
  'Pragma': 'no-cache',
};

// Security headers for OAuth responses
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Content-Security-Policy': "default-src 'none'",
  'Referrer-Policy': 'no-referrer',
};

// Combine all headers for responses
export function getSecureHeaders(): Record<string, string> {
  return {
    ...secureCorsHeaders,
    ...securityHeaders,
    'Content-Type': 'application/json',
  };
}

// OAuth 2.1 compliant token response validation
export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
  refresh_token?: string;
  scope?: string;
  id_token?: string;
}

export function validateTokenResponse(response: unknown): { valid: boolean; error?: string; tokens?: TokenResponse } {
  if (typeof response !== 'object' || response === null) {
    return { valid: false, error: 'Invalid token response format' };
  }
  
  const res = response as Record<string, unknown>;
  
  // Check for error response
  if (res.error) {
    return { valid: false, error: String(res.error_description || res.error) };
  }
  
  // Validate required fields
  if (typeof res.access_token !== 'string' || !res.access_token) {
    return { valid: false, error: 'Missing access_token' };
  }
  
  if (typeof res.token_type !== 'string') {
    // Some providers omit this, default to Bearer
    res.token_type = 'Bearer';
  }
  
  return {
    valid: true,
    tokens: {
      access_token: res.access_token as string,
      token_type: res.token_type as string,
      expires_in: typeof res.expires_in === 'number' ? res.expires_in : undefined,
      refresh_token: typeof res.refresh_token === 'string' ? res.refresh_token : undefined,
      scope: typeof res.scope === 'string' ? res.scope : undefined,
      id_token: typeof res.id_token === 'string' ? res.id_token : undefined,
    }
  };
}
