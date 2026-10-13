/** 발급받은 URL에 이미지 업로드 */
export async function putImage(file, upload, signal) {
  if (!upload?.uploadUrl || !upload.imageUrl || upload.contentType !== file.type)
    throw new Error("INVALID_IMAGE_UPLOAD_RESPONSE");

  // 저장소에는 앱 인증 헤더 없이 파일과 발급된 Content-Type만 전송
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
