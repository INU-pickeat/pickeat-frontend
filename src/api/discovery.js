import { foodNames } from "../constants/restaurant";
import { resolveImageUrl } from "../utils/imageUrl";
import { api } from "./client";

/** 탐색 스팟 화면 데이터 변환 */
export function mapDiscoverySpots(data) {
  if (!Array.isArray(data?.spots)) throw new Error("INVALID_DISCOVERY_RESPONSE");
  return [...data.spots]
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map((spot) => ({
      slug: spot.regionCode.toLowerCase(),
      name: spot.regionName,
      restaurants: [...(spot.restaurants || [])]
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .map((restaurant, index) => ({
          id: restaurant.restaurantId,
          name: restaurant.name,
          category: foodNames[restaurant.foodCategory] || restaurant.foodCategory,
          rank: index + 1,
          region: spot.regionCode.toLowerCase(),
          features: [],
          review: restaurant.oneLineIntro,
          address: restaurant.address,
          openingHoursText: restaurant.openingHoursText,
          phone: restaurant.phoneNumber,
          image: restaurant.representativeImageUrl ? resolveImageUrl(restaurant.representativeImageUrl) : null,
        })),
    }));
}

/** 탐색 스팟 조회 */
export async function getDiscoverySpots(signal) {
  const { data } = await api.get("/v1/discovery-spots", { skipAuth: true, signal });
  return mapDiscoverySpots(data);
}
