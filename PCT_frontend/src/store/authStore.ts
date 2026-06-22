"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types";

interface AuthState {
  user: User | null;
  token: string | null;
  _hasHydrated: boolean;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
  setHasHydrated: (v: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      _hasHydrated: false,
      setHasHydrated: (v) => set({ _hasHydrated: v }),
      setAuth: (user, token) => {
        localStorage.setItem("pct_token", token);
        // Sync a cookie so Next.js middleware (Edge runtime) can read auth state
        const cookieVal = encodeURIComponent(JSON.stringify({ state: { user, token } }));
        document.cookie = `pct_user=${cookieVal};path=/;max-age=${7 * 24 * 3600};SameSite=Lax`;
        set({ user, token });
      },
      clearAuth: () => {
        localStorage.removeItem("pct_token");
        localStorage.removeItem("pct_user");
        document.cookie = "pct_user=;path=/;max-age=0;SameSite=Lax";
        set({ user: null, token: null });
      },
      isAuthenticated: () => !!get().token,
    }),
    {
      name: "pct_user",
      partialize: (s) => ({ user: s.user, token: s.token }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
