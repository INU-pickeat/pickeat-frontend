/** 식당 상세 링크 */
export function restaurantShareUrl(id) {
  return new URL(`/restaurant/${encodeURIComponent(id)}`, window.location.origin).href;
}

/** 기본 공유창 또는 링크 복사 */
export async function shareRestaurantLink({ title, text, url }) {
  if (navigator.share) {
    await navigator.share({ title, ...(text ? { text } : {}), url });
    return "shared";
  }
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(url);
    return "copied";
  }
  return "unsupported";
}
