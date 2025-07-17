// services/api.ts
import axios from "axios";

const BACKEND_URL = process.env.EXPENSE_TRACKER_BACKEND_URL; // Use NEXT_PUBLIC_ for client-side access

const api = axios.create({ 
  baseURL: `${BACKEND_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor to attach Authorization header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;