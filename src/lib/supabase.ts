//src\lib\supabase.ts

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL; // ← เปลี่ยนตรงนี้
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY; // ← เปลี่ยนตรงนี้

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export type Light = {
  id: number;
  s: boolean;
  act: boolean;
  label: string;
};
