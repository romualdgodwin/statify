import axios from "axios";
import { getAppToken } from "./auth";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://127.0.0.1:3000",
});

// Ajoute automatiquement le JWT interne
api.interceptors.request.use((config) => {
  const token = getAppToken();
  if (token) {
    config.headers = config.headers || {}; // 👈 important
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
