import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

// For client-side operations (with RLS)
export const createSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase URL and Anon Key must be provided");
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: async () => {
        const token = await (await auth()).getToken();
        return token ? { Authorization: `Bearer ${token}` } : {};
      },
    },
  });
};

// For server-side operations (bypasses RLS)
export const createSupabaseServerClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Supabase URL and Service Key must be provided");
  }

  return createClient(supabaseUrl, supabaseServiceKey);
};
