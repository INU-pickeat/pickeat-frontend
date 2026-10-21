import { api } from "./client";

/** 내 기록 목록 조회 */
export async function getMyReviews({ period, signal }) {
  const { data } = await api.get("/v1/me/reviews", { params: { period }, signal });
  if (!Array.isArray(data?.reviews)) throw new Error("INVALID_MY_REVIEWS_RESPONSE");
  return [...data.reviews].sort((a, b) => Date.parse(b.selectedAt) - Date.parse(a.selectedAt));
}

/** 기록 작성 */
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

/** 기록 삭제 */
export async function deleteReview(reviewId) {
  await api.delete(`/v1/reviews/${reviewId}`);
}

/** 기록 부분 수정 */
export async function updateReview(reviewId, changes) {
  const fields = ["content", "foodCategory", "companionType", "visibility"];

  const body = Object.fromEntries(
    fields.filter((field) => changes[field] !== undefined).map((field) => [field, changes[field]]),
  );
  const { data } = await api.patch(`/v1/reviews/${reviewId}`, body);
  if (String(data?.reviewId) !== String(reviewId)) throw new Error("INVALID_REVIEW_RESPONSE");
  return data;
}

/** 기록 상세 조회 */
export async function getReview(reviewId, signal) {
  const { data } = await api.get(`/v1/reviews/${reviewId}`, { signal });
  if (String(data?.reviewId) !== String(reviewId)) throw new Error("INVALID_REVIEW_RESPONSE");
  return data;
}

/** 기록 좋아요 */
export async function addReviewLike(reviewId, signal) {
  const { data } = await api.post(`/v1/reviews/${reviewId}/likes`, undefined, { signal });
  if (
    String(data?.reviewId) !== String(reviewId) ||
    data.liked !== true ||
    !Number.isInteger(data.likeCount) ||
    data.likeCount < 0
  )
    throw new Error("INVALID_LIKE_RESPONSE");
  return data;
}

/** 기록 좋아요 취소 */
export async function cancelReviewLike(reviewId, signal) {
  const { data } = await api.delete(`/v1/reviews/${reviewId}/likes`, { signal });
  if (
    String(data?.reviewId) !== String(reviewId) ||
    data.liked !== false ||
    !Number.isInteger(data.likeCount) ||
    data.likeCount < 0
  )
    throw new Error("INVALID_LIKE_RESPONSE");
  return data;
}
