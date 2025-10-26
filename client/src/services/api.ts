import axios from "axios";
import { getAppToken } from "./auth";

const api = axios.create({
  baseURL: "http://localhost:3000", // ton backend
});

// Ajoute automatiquement le JWT interne
api.interceptors.request.use((config) => {
  const token = getAppToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
