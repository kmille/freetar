import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Check if Supabase is configured
export const isSupabaseConfigured = Boolean(
	supabaseUrl &&
		supabaseAnonKey &&
		supabaseUrl !== "your-project-url.supabase.co" &&
		supabaseAnonKey !== "your-anon-key",
);

// Create a single supabase client for interacting with your database
export const supabase = isSupabaseConfigured
	? createClient<Database>(supabaseUrl, supabaseAnonKey, {
			auth: {
				autoRefreshToken: true,
				persistSession: true,
				detectSessionInUrl: true,
			},
		})
	: null;
