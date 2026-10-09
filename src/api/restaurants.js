import { api } from "./client";
import { foodNames } from "./recommendations";

/** 외부 지도 링크 조회 */
export async function getNavigationLinks(id, signal) {
  const { data } = await api.get(`/v1/restaurants/${id}/navigation-links`, { signal });
  return { naverMapUrl: readMapUrl(data?.naverMapUrl), kakaoMapUrl: readMapUrl(data?.kakaoMapUrl) };
}

/** 지도 URL 확인 */
function readMapUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}

/** 식당별 공개 후기 요약 */
export async function getRestaurantReviewSummary(id, signal) {
  const { data } = await api.get(`/v1/restaurants/${id}/review-summary`, { signal });
  if (String(data?.restaurantId) !== String(id) || typeof data.oneLineReview !== "string")
    throw new Error("INVALID_REVIEW_SUMMARY_RESPONSE");
  return data;
}

/** 식당 상세 조회 */
export async function getRestaurant(id, signal) {
  const { data } = await api.get(`/v1/restaurants/${id}`, { skipAuth: true, signal });
  if (String(data?.id) !== String(id)) throw new Error("INVALID_RESTAURANT_RESPONSE");
  const image = data.representativeImageUrl
    ? new URL(data.representativeImageUrl, "https://api.pickeat.kr").href
    : null;
  const images = Array.isArray(data.imageUrls)
    ? [...new Set(data.imageUrls.filter(Boolean).map((url) => new URL(url, "https://api.pickeat.kr").href))].slice(0, 3)
    : [
        image || `https://api.pickeat.kr/api/v1/restaurants/${id}/photo?index=0`,
        ...[1, 2].map((index) => `https://api.pickeat.kr/api/v1/restaurants/${id}/photo?index=${index}`),
      ];
  return {
    ...data,
    phone: data.phoneNumber,
    review: data.oneLineReview,
    images,
    category: foodNames[data.foodCategory] || data.foodCategory,
    features: [
      ["suitableForDate", "데이트"],
      ["suitableForFamily", "가족과 함께"],
      ["suitableForChildren", "아이와 함께"],
      ["suitableForSolo", "혼밥"],
      ["suitableForGroup", "단체"],
      ["suitableForDogs", "반려견과 함께"],
    ]
      .filter(([key]) => data[key] === true)
      .map(([, label]) => label),
    image,
  };
}
