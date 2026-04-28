const { createClient } = require('@supabase/supabase-js');
const env = require('./env');

/**
 * Anon client — uses the user's JWT for row-level security.
 * Pass the user's token via { global: { headers: { Authorization: `Bearer ${token}` } } }
 * or use supabase.auth.setSession() before making calls.
 */
const supabase = createClient(env.supabaseUrl, env.supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
});

/**
 * Admin client — uses the service role key and bypasses RLS.
 * Only use server-side for background sync operations.
 */
const supabaseAdmin = createClient(
  env.supabaseUrl,
  env.supabaseServiceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  }
);

module.exports = { supabase, supabaseAdmin };
