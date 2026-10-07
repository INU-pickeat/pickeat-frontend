import { api } from "./client";
import { foodNames } from "./recommendations";

/** 식당 상세 조회 */
export async function getRestaurant(id, signal) {
  const { data } = await api.get(`/v1/restaurants/${id}`, { skipAuth: true, signal });
  if (String(data?.id) !== String(id)) throw new Error("INVALID_RESTAURANT_RESPONSE");
  return {
    ...data,
    phone: data.phoneNumber,
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
    image: data.representativeImageUrl ? new URL(data.representativeImageUrl, "https://api.pickeat.kr").href : null,
  };
}
