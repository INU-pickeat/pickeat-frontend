import { foodNames, companionNames } from "../constants/restaurant";
import { api } from "./client";
import { resolveImageUrl } from "../utils/imageUrl";

const feedCompanionNames = { ...companionNames, GROUP: "단체·회식" };

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
      thumbnail: resolveImageUrl(item.thumbnailUrl || item.imageUrls?.[0]),
      images: item.imageUrls || [],
      review: item.content,
      tags: [
        feedCompanionNames[item.companionType] || item.companionType,
        foodNames[item.foodCategory] || item.foodCategory,
      ]
        .filter(Boolean)
        .join(" / "),
      liked: item.likedByMe,
      likeCount: item.likeCount,
      createdAt: item.createdAt,
    })),
  };
}

/** 공개 기록 피드 조회 */
export async function getFeed({ cursor, size = 20, signal } = {}) {
  const { data } = await api.get("/v1/feed", { params: { size, ...(cursor != null ? { cursor } : {}) }, signal });
  return mapFeedPage(data);
}
