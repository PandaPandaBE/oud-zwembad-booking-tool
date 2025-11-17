// Export server-side Supabase client functions only
// All Supabase calls are proxied through API routes to keep API keys secure
export { createServerClient, createAdminClient } from "./server";
