import { api } from "./client";
import { putImage } from "./imageUpload";

/** 기록 사진 업로드 */
export async function uploadReviewImage(file, signal) {
  const { data } = await api.post("/v1/reviews/images/upload-urls", { contentTypes: [file.type] }, { signal });
  if (!Array.isArray(data?.uploads) || data.uploads.length !== 1) throw new Error("INVALID_IMAGE_UPLOAD_RESPONSE");
  return putImage(file, data.uploads[0], signal);
}
