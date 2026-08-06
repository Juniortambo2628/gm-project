"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface UseAuthGuardOptions {
  role?: string;
  redirectTo?: string;
}

export function useAuthGuard({ role, redirectTo = "/login" }: UseAuthGuardOptions = {}) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      router.push(redirectTo);
      return;
    }

    if (role && user?.role !== role) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, authLoading, user, role, redirectTo, router]);

  return { user, isAuthenticated, isLoading: authLoading };
}
