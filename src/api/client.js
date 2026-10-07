import axios from "axios";
import { getAccessToken, getRefreshToken, getAuthVersion, rotateAuthTokens, clearAccessToken } from "./tokenStorage";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL?.trim(),
  timeout: 15000,
});

let refreshPromise = null;

/** 토큰 갱신 */
export function refreshTokens() {
  if (refreshPromise) return refreshPromise;
  const refreshToken = getRefreshToken();
  const version = getAuthVersion();
  if (!refreshToken) {
    clearAccessToken();
    return Promise.reject(new Error("REFRESH_TOKEN_MISSING"));
  }
  const pending = api.post("/v1/auth/refresh", { refreshToken }, { skipAuth: true }).then(({ data }) => {
    if (getAuthVersion() !== version) throw new Error("AUTH_SESSION_CHANGED");
    if (typeof data?.accessToken !== "string" || !data.accessToken.trim()
      || typeof data?.refreshToken !== "string" || !data.refreshToken.trim()) throw new Error("INVALID_REFRESH_RESPONSE");
    rotateAuthTokens(data);
    return data.accessToken;
  }).catch((error) => {
    if (getAuthVersion() === version && (error.response?.status === 401 || error.message === "INVALID_REFRESH_RESPONSE")) clearAccessToken();
    throw error;
  }).finally(() => {
    if (refreshPromise === pending) refreshPromise = null;
  });
  refreshPromise = pending;
  return pending;
}

/** 진행 중인 토큰 갱신 대기 */
export async function waitForTokenRefresh() {
  if (refreshPromise) await refreshPromise.catch(() => null);
}

/** 인증 헤더 설정 */
api.interceptors.request.use((config) => {
  if (!config.baseURL) throw new Error("API_BASE_URL_MISSING");
  const token = getAccessToken();
  if (config.skipAuth) {
    config.headers.delete("Authorization");
  } else {
    if (config._authVersion != null && config._authVersion !== getAuthVersion()) throw new Error("AUTH_SESSION_CHANGED");
    config._authVersion = getAuthVersion();
    if (token) config.headers.set("Authorization", `Bearer ${token}`);
    else config.headers.delete("Authorization");
  }
  return config;
});

/** 인증 만료 시 한 번 갱신 후 재요청 */
api.interceptors.response.use((response) => response, async (error) => {
  const config = error.config;
  if (error.response?.status !== 401 || !config || config.skipAuth || config._authRetry) throw error;
  if (config._authVersion !== getAuthVersion()) throw error;
  config._authRetry = true;
  const currentToken = getAccessToken();
  try {
    if (!currentToken || config.headers.get("Authorization") === `Bearer ${currentToken}`) await refreshTokens();
  } catch {
    throw error;
  }
  return api.request(config);
});
