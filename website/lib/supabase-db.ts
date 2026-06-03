import { createClient } from "@supabase/supabase-js";

// Create Supabase client for database operations
export const getSupabaseClient = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.warn('Supabase credentials not found. Using in-memory storage.');
        return null;
    }

    return createClient(supabaseUrl, supabaseKey);
};

// Check if Supabase is configured
export const isSupabaseConfigured = () => {
    return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
};
