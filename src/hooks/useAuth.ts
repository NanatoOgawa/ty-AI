"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export interface UseAuthReturn {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
  checkAuthState: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const checkAuthState = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      console.log("Auth check:", { hasSession: !!session, user: session?.user?.email });
      
      if (!session) {
        console.log("No session found, redirecting to login");
        router.push('/login');
        return;
      }
      
      setUser(session.user);
    } catch (error) {
      console.error("Auth error:", error);
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/login');
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  useEffect(() => {
    checkAuthState();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state change:", event, session);
      
      if (event === 'SIGNED_IN' && session) {
        setUser(session.user);
        setIsLoading(false);
      } else if (event === 'SIGNED_OUT') {
        console.log("User signed out, redirecting to login");
        setUser(null);
        router.push('/login');
      } else if (event === 'TOKEN_REFRESHED') {
        console.log("Token refreshed");
        if (session) {
          setUser(session.user);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, checkAuthState]);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    signOut,
    checkAuthState
  };
}
