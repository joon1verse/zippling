// utilities/serverutil/supabaseClient.js
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

let supabaseAdminClient = null;

export function getSupabaseAdmin() {
  if (supabaseAdminClient) {
    return supabaseAdminClient;
  }
  supabaseAdminClient = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  return supabaseAdminClient;
}