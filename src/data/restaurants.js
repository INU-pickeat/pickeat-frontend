import { popularRestaurantsByRegion } from "./exploreRegions.js";
import { recommendedRestaurants } from "./recommendedRestaurants.js";

// 식당 상세정보 더미데이터
const mockDetails = {
  features: ["단체", "회식"],
  review: "조용하고 프라이빗한 공간에서 분위기 좋고 맛있게 즐길 수 있는 징기스칸 정지인",
  address: "더미 주소",
  phone: "02-000-0000",
  hours: ["월요일", "화요일", "수요일", "목요일", "금요일", "토요일", "일요일"].map((day) => ({
    day,
    time: "11:00 - 21:00",
  })),
};

export const restaurants = [...Object.values(popularRestaurantsByRegion).flat(), ...recommendedRestaurants].map(
  (restaurant) => ({ ...mockDetails, ...restaurant }),
);

export function findRestaurant(id) {
  return restaurants.find((restaurant) => String(restaurant.id) === id);
}
