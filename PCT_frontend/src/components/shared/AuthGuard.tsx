"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import type { Role } from "@/types";

export function AuthGuard({
  children,
  requiredRole,
}: {
  children: React.ReactNode;
  requiredRole?: Role;
}) {
  const router = useRouter();
  const { user, token, _hasHydrated } = useAuthStore();

  const authenticated = !!token;

  useEffect(() => {
    // Wait until Zustand has rehydrated from localStorage before checking auth
    if (!_hasHydrated) return;
    if (!authenticated) {
      router.replace("/login");
      return;
    }
    if (requiredRole && user?.role !== requiredRole) {
      router.replace(`/${user?.role ?? ""}`);
    }
  }, [_hasHydrated, authenticated, user?.role, requiredRole, router]);

  // Render nothing until the store is ready — prevents flash redirect to /login
  if (!_hasHydrated) return null;
  if (!authenticated) return null;
  if (requiredRole && user?.role !== requiredRole) return null;

  return <>{children}</>;
}
