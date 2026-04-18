"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let browserClient: SupabaseClient | null = null;

export function getBrowserSupabase() {
  if (!browserClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl) throw new Error("Missing required frontend env var: NEXT_PUBLIC_SUPABASE_URL");
    if (!supabaseAnonKey) throw new Error("Missing required frontend env var: NEXT_PUBLIC_SUPABASE_ANON_KEY");

    browserClient = createClient(supabaseUrl, supabaseAnonKey);
  }

  return browserClient;
}

export function getBrowserSupabaseSafe() {
  try {
    return getBrowserSupabase();
  } catch (error) {
    console.error("Supabase init failed:", error);
    return null;
  }
}
