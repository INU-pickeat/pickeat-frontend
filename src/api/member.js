import { api } from "./client";
import { setNickname, getAuthVersion } from "./tokenStorage";
import { putImage } from "./imageUpload";

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

/** 프로필 사진 업로드 */
export async function uploadProfileImage(file, signal) {
  const { data } = await api.post("/v1/me/profile-image/upload-url", { contentTypes: [file.type] }, { signal });
  if (!Array.isArray(data?.uploads) || data.uploads.length !== 1) throw new Error("INVALID_IMAGE_UPLOAD_RESPONSE");
  return putImage(file, data.uploads[0], signal);
}
