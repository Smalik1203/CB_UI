import { createClient } from "@supabase/supabase-js";

// Fallback configuration - replace these with your actual Supabase values
const FALLBACK_SUPABASE_URL = "https://mvvzqouqxrtyzuzqbeud.supabase.co";
const FALLBACK_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im12dnpxb3VxeHJ0eXp1enFiZXVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4NDUxNjEsImV4cCI6MjA2ODQyMTE2MX0.pdo_JBuGQP1aRlMLLMoST7xSD89PH2uB6bhzKiJTfu0";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || FALLBACK_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || FALLBACK_SUPABASE_ANON_KEY;
// Check if using fallback values
const usingFallback = supabaseUrl === FALLBACK_SUPABASE_URL || supabaseAnonKey === FALLBACK_SUPABASE_ANON_KEY;

if (usingFallback) {
  console.warn("⚠️ Using fallback Supabase configuration. Please update the values in src/config/supabaseClient.js with your actual Supabase project details:");
  console.warn("1. Replace FALLBACK_SUPABASE_URL with your project URL");
  console.warn("2. Replace FALLBACK_SUPABASE_ANON_KEY with your anon key");
  console.warn("Or set up environment variables by clicking 'Connect to Supabase' in the top right");
}

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase configuration is incomplete. Please update the fallback values in src/config/supabaseClient.js or set up environment variables.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);