import { api } from "./client";

/** 내 Pick 지도 조회 */
export async function getPickMap(signal) {
  const { data } = await api.get("/v1/me/picks/map", { signal });
  if (!Array.isArray(data?.picks)) throw new Error("INVALID_PICK_MAP_RESPONSE");
  return data.picks.filter((pick) => pick.status === "REVIEWED"
    && typeof pick.latitude === "number" && Number.isFinite(pick.latitude) && Math.abs(pick.latitude) <= 90
    && typeof pick.longitude === "number" && Number.isFinite(pick.longitude) && Math.abs(pick.longitude) <= 180);
}

/** 월별 Pick 캘린더 조회 */
export async function getPickCalendar({ year, month, signal }) {
  const { data } = await api.get("/v1/me/picks/calendar", { params: { year, month }, signal });
  if (data?.year !== year || data?.month !== month || !Array.isArray(data?.dates)) {
    throw new Error("INVALID_CALENDAR_RESPONSE");
  }
  return data.dates;
}
