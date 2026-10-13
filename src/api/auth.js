import { api, waitForTokenRefresh } from "./client";
import { setAuthTokens, getRefreshToken, clearAccessToken, getAuthVersion } from "./tokenStorage";
import { getMyInfo } from "./member";

/** 인증번호 발송 */
export async function sendEmailVerification(email) {
  await api.post("/v1/auth/email-verifications", { email: email.trim().toLowerCase() }, { skipAuth: true });
}

/** 인증번호 확인 */
export async function confirmEmailVerification({ email, code }, signal) {
  await api.post(
    "/v1/auth/email-verifications/confirm",
    { email: email.trim().toLowerCase(), code },
    { skipAuth: true, signal },
  );
}

/** 비밀번호 재설정 인증번호 발송 */
export async function sendPasswordResetVerification(email, signal) {
  await api.post("/v1/auth/password-reset/email-verifications", { email: email.trim().toLowerCase() }, { skipAuth: true, signal });
}

/** 비밀번호 재설정 */
export async function resetPassword({ email, newPassword }, signal) {
  const version = getAuthVersion();
  await api.post("/v1/auth/password-reset", { email: email.trim().toLowerCase(), newPassword }, { skipAuth: true, signal });
  if (version === getAuthVersion()) clearAccessToken();
}

/** 회원가입 */
export async function signup({ email, password, nickname }) {
  const { data } = await api.post("/v1/auth/signup", { email, password, nickname }, { skipAuth: true });
  return data;
}

/** 로그인 */
export async function login({ email, password }) {
  const { data } = await api.post("/v1/auth/login", { email, password }, { skipAuth: true });
  if (typeof data?.accessToken !== "string" || !data.accessToken.trim()
    || typeof data?.refreshToken !== "string" || !data.refreshToken.trim()) {
    throw new Error("ACCESS_TOKEN_MISSING");
  }
  setAuthTokens(data);
  // 프로필 조회 실패 시에도 로그인은 유지
  await getMyInfo().catch(() => null);
}

/** 로그아웃 */
export async function logout() {
  const version = getAuthVersion();
  await waitForTokenRefresh();
  if (getAuthVersion() !== version) return;
  const refreshToken = getRefreshToken();
  clearAccessToken();
  if (refreshToken) await api.post("/v1/auth/logout", { refreshToken }, { skipAuth: true });
}
