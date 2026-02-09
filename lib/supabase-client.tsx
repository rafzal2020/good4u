"use client";

import { createClient } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";

// Use placeholders during build when env is missing so createClient doesn't throw
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface SupabaseContextType {
  supabase: typeof supabase;
  user: any;
  signInAnonymously: () => Promise<void>;
  loading: boolean;
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(
  undefined
);

export function SupabaseProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        supabase.from("users").upsert({ id: session.user.id }, { onConflict: "id" }).then(() => {});
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        supabase.from("users").upsert({ id: session.user.id }, { onConflict: "id" }).then(() => {});
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInAnonymously = async () => {
    try {
      const { data, error } = await supabase.auth.signInAnonymously();
      if (error) throw error;
      setUser(data.user);
      if (data.user) {
        await supabase.from("users").upsert({ id: data.user.id }, { onConflict: "id" });
      }
    } catch (error) {
      console.error("Error signing in anonymously:", error);
    }
  };

  return (
    <SupabaseContext.Provider
      value={{ supabase, user, signInAnonymously, loading }}
    >
      {children}
    </SupabaseContext.Provider>
  );
}

export function useSupabase() {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error("useSupabase must be used within a SupabaseProvider");
  }
  return context;
}
