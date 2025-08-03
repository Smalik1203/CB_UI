import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables:");
  console.error("VITE_SUPABASE_URL:", supabaseUrl);
  console.error("VITE_SUPABASE_ANON_KEY:", supabaseAnonKey ? "Present" : "Missing");
  throw new Error("Supabase configuration is missing. Please click 'Connect to Supabase' in the top right to set up your Supabase connection.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);