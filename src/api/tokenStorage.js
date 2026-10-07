const ACCESS_TOKEN_KEY = "pickeat.accessToken";

/** 토큰 조회 */
export function getAccessToken() {
  return sessionStorage.getItem(ACCESS_TOKEN_KEY);
}

/** 토큰 저장 */
export function setAccessToken(token) {
  sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
}

/** 토큰 삭제 */
export function clearAccessToken() {
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
}
