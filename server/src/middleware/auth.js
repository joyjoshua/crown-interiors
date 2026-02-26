/**
 * Authentication Middleware
 *
 * Verifies the JWT token from Supabase Auth by calling getUser()
 * using the admin (Service Role Key) client.
 *
 * On success, attaches `user` and `userId` to the request object
 * so downstream controllers/services can identify the authenticated user.
 *
 * Uses the Service Role Key client from config/supabase.js because:
 *   1. It can validate any user's JWT (not scoped to a single user)
 *   2. It avoids creating a redundant Supabase client
 *   3. It checks if the user account is still active (not just token validity)
 *
 * Expected header format: Authorization: Bearer <access_token>
 */

const { supabaseAdmin } = require('../config/supabase');

/** True if the error is a transient network/connectivity failure (e.g. backend cannot reach Supabase). */
function isTransientAuthError(error) {
  if (!error?.message) return false;
  const msg = error.message.toLowerCase();
  return msg === 'fetch failed' || msg.includes('econnrefused') || msg.includes('etimedout') || msg.includes('enotfound') || msg.includes('network');
}

const AUTH_GET_USER_RETRIES = 2;
const AUTH_GET_USER_DELAYS_MS = [200, 500];

/**
 * Express middleware that authenticates requests using Supabase JWT.
 * Rejects requests without a valid Bearer token.
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Check for the Authorization header and Bearer prefix
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Missing or invalid authorization header',
      });
    }

    const token = authHeader.split(' ')[1];

    // ── Debug: decode and log the token payload (development only) ──
    if (process.env.NODE_ENV !== 'production') {
      try {
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        const now = Math.floor(Date.now() / 1000);
        console.log('[AUTH DEBUG]', {
          tokenPreview: token.substring(0, 30) + '...',
          exp: payload.exp,
          iat: payload.iat,
          nowUnix: now,
          expiresIn: payload.exp ? `${payload.exp - now}s` : 'N/A',
          isExpired: payload.exp ? payload.exp < now : 'unknown',
          sub: payload.sub,
          role: payload.role,
        });
      } catch (e) {
        console.log('[AUTH DEBUG] Failed to decode token:', e.message);
      }
    }

    // Verify the JWT with Supabase — with retries for transient "fetch failed" (server cannot reach Supabase)
    let lastError = null;
    let user = null;
    for (let attempt = 0; attempt <= AUTH_GET_USER_RETRIES; attempt++) {
      const { data, error } = await supabaseAdmin.auth.getUser(token);
      if (!error && data?.user) {
        user = data.user;
        break;
      }
      lastError = error;
      if (!error || !isTransientAuthError(error)) break;
      if (attempt < AUTH_GET_USER_RETRIES) {
        await new Promise((r) => setTimeout(r, AUTH_GET_USER_DELAYS_MS[attempt]));
      }
    }

    if (process.env.NODE_ENV !== 'production') {
      console.log('[AUTH DEBUG] getUser result:', {
        hasUser: !!user,
        userId: user?.id,
        errorMessage: lastError?.message,
        errorStatus: lastError?.status,
        errorCode: lastError?.code,
      });
    }

    if (lastError || !user) {
      const isTransient = lastError && isTransientAuthError(lastError);
      if (isTransient) {
        console.error('Auth verification failed (transient — Supabase unreachable):', lastError?.message);
        return res.status(503).json({
          success: false,
          error: 'Auth service temporarily unavailable. Please try again.',
        });
      }
      console.error('Auth verification failed:', {
        error: lastError?.message || 'No user returned',
        errorStatus: lastError?.status,
        errorCode: lastError?.code,
        tokenPreview: token ? `${token.substring(0, 20)}...` : 'EMPTY',
      });
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token',
      });
    }

    // Attach authenticated user info to the request
    req.user = user;
    req.userId = user.id;

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      error: 'Authentication failed',
    });
  }
};

module.exports = { authenticate };
