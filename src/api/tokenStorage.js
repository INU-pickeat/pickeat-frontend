const ACCESS_TOKEN_KEY = "pickeat.accessToken";
const NICKNAME_KEY = "pickeat.nickname";
const REFRESH_TOKEN_KEY = "pickeat.refreshToken";
let authVersion = 0;

/** 로그인 세션 버전 조회 */
export function getAuthVersion() {
  return authVersion;
}

/** 갱신 토큰 조회 */
export function getRefreshToken() {
  return sessionStorage.getItem(REFRESH_TOKEN_KEY);
}

/** 로그인 토큰 저장 */
export function setAuthTokens({ accessToken, refreshToken }) {
  setAccessToken(accessToken);
  if (refreshToken) sessionStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

/** 토큰 쌍 교체 */
export function rotateAuthTokens({ accessToken, refreshToken }) {
  sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  sessionStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

/** 닉네임 조회 */
export function getNickname() {
  return sessionStorage.getItem(NICKNAME_KEY);
}

/** 닉네임 저장 */
export function setNickname(nickname) {
  if (typeof nickname === "string" && nickname.trim()) {
    sessionStorage.setItem(NICKNAME_KEY, nickname.trim());
  } else {
    sessionStorage.removeItem(NICKNAME_KEY);
  }
}

/** 토큰 조회 */
export function getAccessToken() {
  return sessionStorage.getItem(ACCESS_TOKEN_KEY);
}

/** 토큰 저장 */
export function setAccessToken(token) {
  authVersion += 1;
  sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  sessionStorage.removeItem(NICKNAME_KEY);
  sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
}

/** 토큰 삭제 */
export function clearAccessToken() {
  authVersion += 1;
  sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  sessionStorage.removeItem(NICKNAME_KEY);
}
