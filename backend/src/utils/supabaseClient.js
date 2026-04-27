const { createClient } = require('@supabase/supabase-js');
const env = require('../config/env');

// Creates a Supabase client scoped to the authenticated user's JWT,
// ensuring RLS policies are enforced for all queries.
function userClient(req) {
  const token = (req.headers['authorization'] || '').slice(7);
  return createClient(env.supabaseUrl, env.supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  });
}

module.exports = { userClient };
