import axios from "axios";
import { authClient } from "./auth-client";

export const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const cookie = authClient.getCookie();
  if (cookie) {
    config.headers.cookie = cookie;
    
    // Also extract the raw session token to support Authorization: Bearer <token>
    const match = cookie.match(/better-auth\.session-token=([^;]+)/);
    const token = match ? match[1] : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

