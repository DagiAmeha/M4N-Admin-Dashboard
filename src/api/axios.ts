import axios from "axios";
import { auth } from "../lib/firebase";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000",
});

// Attach a fresh Firebase ID token on every request
api.interceptors.request.use(async (config) => {
  const fbUser = auth.currentUser;
  if (fbUser) {
    // getIdToken(true) forces a refresh if expired; false uses cache
    const token = await fbUser.getIdToken(false);
    localStorage.setItem("admin_token", token);
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    const token = localStorage.getItem("admin_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    // Only handle authentication redirect, no toast or user-facing error messages
    if (error.response?.status === 401) {
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_user");
      window.location.href = "/login";
    }
    // All other errors are handled in the calling code
    return Promise.reject(error);
  },
);

export default api;
