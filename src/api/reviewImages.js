/** 발급받은 URL에 후기 사진 업로드 */
export async function putReviewImage(file, upload, signal) {
  if (!upload?.uploadUrl || !upload.imageUrl || upload.contentType !== file.type)
    throw new Error("INVALID_IMAGE_UPLOAD_RESPONSE");

  // S3에는 앱 인증 헤더 없이 파일과 발급된 Content-Type만 보내기
  const response = await fetch(upload.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": upload.contentType },
    body: file,
    credentials: "omit",
    signal,
  });
  if (!response.ok) throw new Error("IMAGE_UPLOAD_FAILED");
  return upload.imageUrl;
}
import { api } from "./client";

/** 후기 사진 업로드 */
export async function uploadReviewImage(file, signal) {
  const { data } = await api.post("/v1/reviews/images/upload-urls", { contentTypes: [file.type] }, { signal });
  if (!Array.isArray(data?.uploads) || data.uploads.length !== 1) throw new Error("INVALID_IMAGE_UPLOAD_RESPONSE");
  return putReviewImage(file, data.uploads[0], signal);
}
