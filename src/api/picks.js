import { api } from "./client";

/** Pick 선택 저장 */
export async function createPick({ recommendationSessionId, restaurantId }) {
  const { data } = await api.post("/v1/picks", { recommendationSessionId, restaurantId });
  if (data?.pickId == null || String(data.restaurantId) !== String(restaurantId) || data.status !== "SELECTED")
    throw new Error("INVALID_PICK_RESPONSE");
  return data;
}

/** 기간별 내 Pick 목록 조회 */
export async function getMyPicks({ period, signal }) {
  const { data } = await api.get("/v1/me/picks", { params: { period }, signal });
  if (!Array.isArray(data?.restaurants)) throw new Error("INVALID_PICKS_RESPONSE");
  return [...data.restaurants].sort((a, b) => Date.parse(b.latestPickedAt) - Date.parse(a.latestPickedAt));
}

/** 내 Pick 지도 조회 */
export async function getPickMap(signal) {
  const { data } = await api.get("/v1/me/picks/map", { signal });
  if (!Array.isArray(data?.picks)) throw new Error("INVALID_PICK_MAP_RESPONSE");
  return data.picks.filter(
    (pick) =>
      pick.status === "REVIEWED" &&
      typeof pick.latitude === "number" &&
      Number.isFinite(pick.latitude) &&
      Math.abs(pick.latitude) <= 90 &&
      typeof pick.longitude === "number" &&
      Number.isFinite(pick.longitude) &&
      Math.abs(pick.longitude) <= 180,
  );
}

/** 월별 Pick 캘린더 조회 */
export async function getPickCalendar({ year, month, signal }) {
  const { data } = await api.get("/v1/me/picks/calendar", { params: { year, month }, signal });
  if (data?.year !== year || data?.month !== month || !Array.isArray(data?.dates) || !Array.isArray(data?.picks)) {
    throw new Error("INVALID_CALENDAR_RESPONSE");
  }
  return { dates: data.dates, picks: data.picks.filter((pick) => pick.status !== "CANCELED") };
}
