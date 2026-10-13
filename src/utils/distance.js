/** 추천 위치에서 식당까지의 거리 */
export function formatDistance(meters) {
  if (!Number.isFinite(meters) || meters < 0) return null;
  return meters < 1000 ? `${Math.round(meters)}m` : `${Number((meters / 1000).toFixed(1))}km`;
}
