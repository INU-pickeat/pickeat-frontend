/** 서버 오류 메시지 */
export function getApiErrorMessage(error, fallback = "잠시 후 다시 시도해주세요.") {
  const message = error?.response?.data?.message;
  return typeof message === "string" && message.trim() ? message.trim() : fallback;
}
