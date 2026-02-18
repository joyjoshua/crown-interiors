/**
 * Supabase Admin Client Configuration
 *
 * Creates a Supabase client using the Service Role Key,
 * which bypasses Row Level Security (RLS). This is intentional —
 * the backend handles authorization through JWT middleware,
 * and RLS serves as an additional safety net for direct client access.
 *
 * ⚠️  NEVER expose the Service Role Key to the frontend.
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validate required environment variables at startup
if (!supabaseUrl || !supabaseServiceKey) {
  console.error(
    '❌ Missing Supabase environment variables. Check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env'
  );
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

module.exports = { supabaseAdmin };
