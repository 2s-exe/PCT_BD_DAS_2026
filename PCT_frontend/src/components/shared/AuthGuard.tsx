"use client";
import { useState, useEffect } from "react";
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
  const { user, token } = useAuthStore();
  // Zustand persist hydrates from localStorage asynchronously after first render.
  // We must not redirect until hydration is complete — otherwise token appears null
  // on every page refresh even when the user is logged in.
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const authenticated = !!token;

  useEffect(() => {
    if (!hydrated) return;
    if (!authenticated) {
      router.replace("/login");
      return;
    }
    if (requiredRole && user?.role !== requiredRole) {
      router.replace(`/${user?.role ?? ""}`);
    }
  }, [hydrated, authenticated, user?.role, requiredRole, router]);

  if (!hydrated) return null;
  if (!authenticated) return null;
  if (requiredRole && user?.role !== requiredRole) return null;

  return <>{children}</>;
}
