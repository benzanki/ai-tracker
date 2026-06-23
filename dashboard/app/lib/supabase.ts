import { createClient } from "@supabase/supabase-js";

// Server-side read-only client — never exposed to the browser
// NEXT_PUBLIC_ prefix intentionally NOT used for the service key
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);
