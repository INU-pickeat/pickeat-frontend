import { api } from "./client";

/** 후기 상세 조회 */
export async function getReview(reviewId, signal) {
  const { data } = await api.get(`/v1/reviews/${reviewId}`, { signal });
  if (String(data?.reviewId) !== String(reviewId)) throw new Error("INVALID_REVIEW_RESPONSE");
  return data;
}
