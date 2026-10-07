import { api } from "./client";

export const foodNames = {
  KOREAN: "한식",
  JAPANESE: "일식",
  CHINESE: "중식",
  WESTERN: "양식",
  CAFE_DESSERT: "커피·디저트",
  PUB_BAR: "펍·와인·술집",
  OTHER: "기타",
};
const foods = {
  korean: "KOREAN",
  japanese: "JAPANESE",
  chinese: "CHINESE",
  italian: "WESTERN",
  dessert: "CAFE_DESSERT",
  alcohol: "PUB_BAR",
  etc: "OTHER",
};
const companions = { date: "DATE", family: "FAMILY", kids: "CHILDREN", solo: "SOLO", group: "GROUP", pet: "DOG" };

/** 추천 요청 변환 */
export function buildRecommendationRequest(state) {
  const { latitude, longitude, situation, category, price } = state || {};
  if (
    !Number.isFinite(latitude) ||
    Math.abs(latitude) > 90 ||
    !Number.isFinite(longitude) ||
    Math.abs(longitude) > 180 ||
    !foods[category] ||
    !companions[situation]
  )
    throw new Error("INVALID_RECOMMENDATION_INPUT");
  const body = { latitude, longitude, foodCategories: [foods[category]], companionType: companions[situation] };
  if (price !== "any") {
    if (!Number.isFinite(price?.min) || !Number.isFinite(price?.max) || price.min < 0 || price.min > price.max)
      throw new Error("INVALID_RECOMMENDATION_INPUT");
    body.priceRange = { min: price.min * 10000, max: price.max * 10000 };
  }
  return body;
}

/** 추천 응답 확인 */
function readSession(data) {
  if (data?.sessionId == null || !Array.isArray(data.items)) throw new Error("INVALID_RECOMMENDATION_RESPONSE");
  return { ...data, items: [...data.items].sort((a, b) => a.rank - b.rank) };
}

/** 추천 생성 */
export async function createRecommendation(body) {
  const { data } = await api.post("/v1/recommendations", body);
  return readSession(data);
}

/** 추천 세션 조회 */
export async function getRecommendation(sessionId, signal) {
  const { data } = await api.get(`/v1/recommendations/${sessionId}`, { signal });
  return readSession(data);
}

/** 추천 식당 제외 */
export async function excludeRecommendation(sessionId, restaurantId, reason) {
  const { data } = await api.post(`/v1/recommendations/${sessionId}/exclusions`, { restaurantId, reason });
  return readSession(data);
}
