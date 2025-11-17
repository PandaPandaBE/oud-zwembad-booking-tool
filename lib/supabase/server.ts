import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_URL");
}

if (!supabaseAnonKey) {
  throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

/**
 * Creates a Supabase client for server-side usage with anon key.
 * Use this for regular database operations that respect RLS policies.
 */
export function createServerClient() {
  return createClient<Database>(supabaseUrl!, supabaseAnonKey!);
}

/**
 * Creates a Supabase client for server-side usage with service role key.
 * Use this for admin operations that bypass RLS policies.
 * WARNING: Only use in secure server contexts, never expose to client.
 */
export function createAdminClient() {
  if (!supabaseServiceRoleKey) {
    throw new Error("Missing env.SUPABASE_SERVICE_ROLE_KEY");
  }

  return createClient<Database>(supabaseUrl!, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
