import { api } from "./client";

/** 내 기록 좋아요 알림 조회 */
export async function getNotifications(signal) {
  const { data } = await api.get("/v1/me/notifications", { signal });
  if (!Array.isArray(data?.notifications)) throw new Error("INVALID_NOTIFICATIONS_RESPONSE");
  return data.notifications;
}
