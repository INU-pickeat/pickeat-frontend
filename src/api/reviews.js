import { api } from "./client";

/** 내 후기 목록 조회 */
export async function getMyReviews({ period, signal }) {
  const { data } = await api.get("/v1/me/reviews", { params: { period }, signal });
  if (!Array.isArray(data?.reviews)) throw new Error("INVALID_MY_REVIEWS_RESPONSE");
  return [...data.reviews].sort((a, b) => Date.parse(b.selectedAt) - Date.parse(a.selectedAt));
}

/** 후기 작성 */
export async function createReview({ pickId, content, foodCategory, companionType, visibility, imageUrls }) {
  const body = {
    pickId,
    content,
    foodCategory,
    companionType,
    visibility,
    ...(imageUrls ? { imageUrls } : {}),
  };
  const { data } = await api.post("/v1/reviews", body);
  if (data?.reviewId == null || String(data.pickId) !== String(pickId)) throw new Error("INVALID_REVIEW_RESPONSE");
  return data;
}

/** 후기 삭제 */
export async function deleteReview(reviewId) {
  await api.delete(`/v1/reviews/${reviewId}`);
}

/** 후기 부분 수정 */
export async function updateReview(reviewId, changes) {
  const fields = ["content", "foodCategory", "companionType", "visibility", "imageUrls"];

  const body = Object.fromEntries(
    fields.filter((field) => changes[field] !== undefined).map((field) => [field, changes[field]]),
  );
  const { data } = await api.patch(`/v1/reviews/${reviewId}`, body);
  if (String(data?.reviewId) !== String(reviewId)) throw new Error("INVALID_REVIEW_RESPONSE");
  return data;
}

/** 후기 상세 조회 */
export async function getReview(reviewId, signal) {
  const { data } = await api.get(`/v1/reviews/${reviewId}`, { signal });
  if (String(data?.reviewId) !== String(reviewId)) throw new Error("INVALID_REVIEW_RESPONSE");
  return data;
}
