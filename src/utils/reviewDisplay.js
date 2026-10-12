import { foodNames, companionNames } from "../constants/restaurant";
import { resolveImageUrl } from "./imageUrl";

/** 기록 표시용 태그 */
export function reviewTags(item) {
  return [companionNames[item.companionType], foodNames[item.foodCategory]].filter(Boolean).join(" / ");
}

/** API 이미지 주소 */
export function reviewImageUrl(url) {
  return resolveImageUrl(url);
}

/** 한국 시간의 선택 날짜 */
export function selectedDateLabel(value) {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(value));
}
