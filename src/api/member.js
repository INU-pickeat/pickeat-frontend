import { api } from "./client";
import { setNickname, getAuthVersion } from "./tokenStorage";

/** 내 정보 조회 */
export async function getMyInfo(signal) {
  const version = getAuthVersion();
  const { data } = await api.get("/v1/me", { signal });
  if (version === getAuthVersion()) setNickname(data.nickname);
  return data;
}

/** 내 정보 부분 수정 */
export async function updateMyInfo(changes, signal) {
  const version = getAuthVersion();
  const { data } = await api.patch("/v1/me", changes, { signal });
  if (version === getAuthVersion()) setNickname(data.nickname);
  return data;
}
