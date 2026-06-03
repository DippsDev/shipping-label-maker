import { supabase } from "./supabase-client";
import { useEffect, useState } from "react";
import type { User, Session } from "@supabase/supabase-js";

// Sign up with email and password
export const signUp = {
    email: async ({ email, password, name }: { email: string; password: string; name?: string }) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    name: name || "",
                },
            },
        });

        if (error) throw error;
        return data;
    },
};

// Sign in with email and password
export const signIn = {
    email: async ({ email, password }: { email: string; password: string }) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) throw error;
        return data;
    },
    social: async ({ provider, callbackURL }: { provider: "google" | "github"; callbackURL?: string }) => {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo: callbackURL ? `${window.location.origin}${callbackURL}` : undefined,
            },
        });

        if (error) throw error;
        return data;
    },
};

// Sign out
export const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
};

// Hook to get current session
export const useSession = () => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [isPending, setIsPending] = useState(true);

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            setIsPending(false);
        });

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            setIsPending(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    return {
        data: session ? { user, session } : null,
        isPending,
    };
};
