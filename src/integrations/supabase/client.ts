import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const isSupabaseConfigured = Boolean(
  SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY,
);

// Keep the app renderable even when local envs are not set yet.
export const supabase = isSupabaseConfigured
  ? createClient<Database>(SUPABASE_URL!, SUPABASE_PUBLISHABLE_KEY!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;
