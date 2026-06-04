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
  // Utiliser token (primitif réactif) au lieu de isAuthenticated (fonction non-réactive)
  const { user, token } = useAuthStore();
  const authenticated = !!token;

  useEffect(() => {
    if (!authenticated) {
      router.replace("/login");
      return;
    }
    if (requiredRole && user?.role !== requiredRole) {
      router.replace(`/${user?.role ?? ""}`);
    }
  }, [authenticated, user?.role, requiredRole, router]);

  if (!authenticated) return null;
  if (requiredRole && user?.role !== requiredRole) return null;

  return <>{children}</>;
}
