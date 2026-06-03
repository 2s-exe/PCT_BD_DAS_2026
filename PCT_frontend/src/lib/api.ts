import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1",
  headers: { "Content-Type": "application/json", Accept: "application/json" },
  withCredentials: true,
});

// Injecter le token Sanctum à chaque requête
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("pct_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Gérer les erreurs 401 globalement
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("pct_token");
      localStorage.removeItem("pct_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
