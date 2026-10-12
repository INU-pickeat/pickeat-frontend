/** API 이미지 주소 */
export function resolveImageUrl(url) {
  return url ? new URL(url, "https://api.pickeat.kr").href : null;
}
