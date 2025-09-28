import { createClient } from "@supabase/supabase-js";

// Debug environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_PET_PORTAL_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_PET_PORTAL_ANON;

console.log("🔧 Supabase Configuration:");
console.log("URL:", supabaseUrl ? "✅ Set" : "❌ Missing");
console.log("Anon Key:", supabaseAnonKey ? "✅ Set" : "❌ Missing");

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Missing Supabase environment variables!");
  console.error("Required: NEXT_PUBLIC_PET_PORTAL_URL, NEXT_PUBLIC_PET_PORTAL_ANON");
  console.error("Current URL:", supabaseUrl);
  console.error("Current Key:", supabaseAnonKey ? "Present but hidden" : "Missing");

  // Don't create client with undefined values
  throw new Error("Supabase configuration is missing. Please check your environment variables.");
}

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false
    },
    global: {
      headers: {
        'X-Client-Info': 'pet-portal-client'
      }
    }
  }
);

// Test connection and URL accessibility
if (typeof window !== 'undefined') {
  // Test URL accessibility
  fetch(supabaseUrl + '/rest/v1/', {
    method: 'HEAD',
    headers: {
      'apikey': supabaseAnonKey
    }
  }).then(response => {
    if (response.ok) {
      console.log("✅ Supabase URL is accessible");
    } else {
      console.error("❌ Supabase URL returned error:", response.status, response.statusText);
    }
  }).catch(err => {
    console.error("❌ Cannot reach Supabase URL:", err);
    console.error("URL being tested:", supabaseUrl + '/rest/v1/');
  });

  // Test auth session
  supabase.auth.getSession().then(({ data, error }) => {
    if (error) {
      console.error("❌ Supabase auth test failed:", error);
    } else {
      console.log("✅ Supabase auth client initialized successfully");
    }
  }).catch(err => {
    console.error("❌ Supabase auth connection error:", err);
  });
}