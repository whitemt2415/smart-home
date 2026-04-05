// src/lib/supabase.ts

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    "[supabase] Missing env vars — ตรวจสอบว่ามี VITE_SUPABASE_URL และ VITE_SUPABASE_ANON_KEY ใน .env"
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);