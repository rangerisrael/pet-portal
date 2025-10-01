import { createClient } from '@supabase/supabase-js';

// Create a Supabase admin client with service role key
export function createSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_PET_PORTAL_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.log('Missing Supabase admin environment variables:', {
      url: !!supabaseUrl,
      serviceKey: !!supabaseServiceKey
    });
    return null;
  }

  // Create admin client with service role key
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  return supabaseAdmin;
}

// Export a singleton instance
export const supabaseAdmin = createSupabaseAdmin();