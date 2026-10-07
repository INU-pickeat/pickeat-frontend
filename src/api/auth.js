import { api } from "./client";
import { setAccessToken } from "./tokenStorage";

/** 인증번호 발송 */
export async function sendEmailVerification(email) {
  await api.post("/v1/auth/email-verifications", { email: email.trim().toLowerCase() }, { skipAuth: true });
}

/** 인증번호 확인 */
export async function confirmEmailVerification({ email, code }) {
  await api.post("/v1/auth/email-verifications/confirm", { email: email.trim().toLowerCase(), code }, { skipAuth: true });
}

/** 회원가입 */
export async function signup({ email, password, nickname }) {
  const { data } = await api.post("/v1/auth/signup", { email, password, nickname }, { skipAuth: true });
  return data;
}

/** 로그인 */
export async function login({ email, password }) {
  const { data } = await api.post("/v1/auth/login", { email, password }, { skipAuth: true });
  if (typeof data?.accessToken !== "string" || !data.accessToken.trim()) {
    throw new Error("ACCESS_TOKEN_MISSING");
  }
  setAccessToken(data.accessToken);
}
