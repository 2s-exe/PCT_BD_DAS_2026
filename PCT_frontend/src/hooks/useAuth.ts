"use client";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";
import type { AuthResponse } from "@/types";

export function useAuth() {
  const router = useRouter();
  const { user, token, setAuth, clearAuth, isAuthenticated } = useAuthStore();

  const login = async (login: string, password: string) => {
    const { data } = await api.post<AuthResponse>("/login", { login, password });
    setAuth(data.user, data.token);
    // Redirection selon le rôle
    const routes: Record<string, string> = {
      admin: "/admin",
      secretaire: "/secretaire",
      enseignant: "/enseignant",
    };
    router.push(routes[data.user.role] || "/");
    return data;
  };

  const logout = async () => {
    try { await api.post("/logout"); } catch {}
    clearAuth();
    router.push("/login");
  };

  return { user, token, login, logout, isAuthenticated };
}
