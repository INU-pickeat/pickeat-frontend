import { foodNames } from "../api/recommendations";

const companionNames = { DATE: "데이트", FAMILY: "가족과 함께", CHILDREN: "아이와 함께", SOLO: "혼밥", GROUP: "단체", DOG: "반려견과 함께" };

/** 후기 표시용 태그 */
export function reviewTags(item) {
  return [companionNames[item.companionType], foodNames[item.foodCategory]].filter(Boolean).join(" / ");
}

/** API 이미지 주소 */
export function reviewImageUrl(url) {
  return url ? new URL(url, "https://api.pickeat.kr").href : null;
}

/** 한국 시간의 선택 날짜 */
export function selectedDateLabel(value) {
  return new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", year: "numeric", month: "long", day: "numeric" }).format(new Date(value));
}
