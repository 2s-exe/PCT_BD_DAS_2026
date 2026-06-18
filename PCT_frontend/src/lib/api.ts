import axios from "axios";

const BASE = (process.env.NEXT_PUBLIC_API_URL ?? "https://pct-bd-das-2026-516n.onrender.com").replace(/\/$/, "");

const api = axios.create({
  baseURL: `${BASE}/api/v1`,
  headers: { "Content-Type": "application/json", Accept: "application/json" },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("pct_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    // 401 = token invalide/expiré, 403 sur /me = session corrompue
    const isAuthError =
      status === 401 ||
      (status === 403 && error.config?.url?.includes("/me"));
    if (isAuthError && typeof window !== "undefined") {
      const isLoginPage = window.location.pathname === "/login" ||
                          window.location.pathname === "/forgot-password";
      localStorage.removeItem("pct_token");
      localStorage.removeItem("pct_user");
      document.cookie = "pct_user=;path=/;max-age=0;SameSite=Lax";
      if (!isLoginPage) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
