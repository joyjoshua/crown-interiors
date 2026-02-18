/**
 * Authentication Middleware
 *
 * Verifies the JWT token from Supabase Auth by calling getUser().
 * On success, attaches `user` and `userId` to the request object
 * so downstream controllers/services can identify the authenticated user.
 *
 * Expected header format: Authorization: Bearer <access_token>
 */

const { createClient } = require('@supabase/supabase-js');

// Use the Anon Key for auth verification (matches frontend token signatures)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

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

    // Verify the JWT with Supabase — validates signature + expiry
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
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
