import { api } from "./client";

/** 후기 좋아요 */
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

/** 후기 좋아요 취소 */
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

const foodNames = {
  KOREAN: "한식",
  JAPANESE: "일식",
  CHINESE: "중식",
  ITALIAN: "양식",
  WESTERN: "양식",
  DESSERT: "커피·디저트",
  ALCOHOL: "펍·와인·술집",
  ETC: "기타",
};

const companionNames = {
  DATE: "데이트",
  FAMILY: "가족과 함께",
  KIDS: "아이와 함께",
  SOLO: "혼밥",
  GROUP: "단체·회식",
  PET: "반려견과 함께",
};

/** 피드 화면 데이터 변환 */
export function mapFeedPage(data) {
  if (!Array.isArray(data?.items) || !("nextCursor" in data)) throw new Error("INVALID_FEED_RESPONSE");
  return {
    nextCursor: data.nextCursor,
    items: data.items.map((item) => ({
      id: item.reviewId,
      restaurantId: item.restaurantId,
      restaurantName: item.restaurantName,
      author: item.authorNickname,
      avatar: item.authorProfileImageUrl,
      image: item.imageUrls?.[0] || null,
      images: item.imageUrls || [],
      review: item.content,
      tags: [
        companionNames[item.companionType] || item.companionType,
        foodNames[item.foodCategory] || item.foodCategory,
      ]
        .filter(Boolean)
        .join(" / "),
      liked: item.likedByMe,
      likeCount: item.likeCount,
      rating: item.rating,
      createdAt: item.createdAt,
    })),
  };
}

/** 공개 후기 피드 조회 */
export async function getFeed({ cursor, size = 20, signal } = {}) {
  const { data } = await api.get("/v1/feed", { params: { size, ...(cursor != null ? { cursor } : {}) }, signal });
  return mapFeedPage(data);
}
