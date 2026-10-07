import axios from "axios";
import { getAccessToken } from "./tokenStorage";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL?.trim(),
  timeout: 15000,
});

/** 인증 헤더 설정 */
api.interceptors.request.use((config) => {
  if (!config.baseURL) throw new Error("API_BASE_URL_MISSING");
  const token = getAccessToken();
  if (token && !config.skipAuth) config.headers.set("Authorization", `Bearer ${token}`);
  return config;
});
