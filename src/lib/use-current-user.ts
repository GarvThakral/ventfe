"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { api } from "@/lib/api";
import { getBrowserSupabaseSafe } from "@/lib/supabase";
import type { User } from "@/lib/types";

export function useCurrentUser(options?: { redirectTo?: string }) {
  const router = useRouter();
  const redirectTo = options?.redirectTo ?? "/login";
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUser = useCallback(async () => {
    try {
      const currentUser = await api.me();
      setUser(currentUser);
      return currentUser;
    } catch {
      const supabase = getBrowserSupabaseSafe();
      if (supabase) {
        await supabase.auth.signOut();
      }
      setUser(null);
      if (redirectTo) {
        router.replace(redirectTo);
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [redirectTo, router]);

  useEffect(() => {
    void loadUser();
  }, [loadUser]);

  return {
    user,
    isLoading,
    refreshUser: loadUser,
  };
}
