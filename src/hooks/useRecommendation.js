import { useEffect, useRef, useState } from "react";
import { getRecommendation, excludeRecommendation } from "../api/recommendations";
import { getRestaurant } from "../api/restaurants";

/** 추천 목록 조회 및 제외 */
export default function useRecommendation(sessionId) {
  const [state, setState] = useState({ items: [], isLoading: true, error: "" });
  const [attempt, setAttempt] = useState(0);
  const [isExcluding, setIsExcluding] = useState(false);
  const busy = useRef(false);
  const generation = useRef(0);
  const requestKey = `${sessionId}:${attempt}`;

  useEffect(() => {
    const controller = new AbortController();
    const version = ++generation.current;
    async function load() {
      try {
        if (!sessionId) throw new Error("MISSING_SESSION");
        const session = await getRecommendation(sessionId, controller.signal);
        const items = await hydrate(session.items, controller.signal);
        if (!controller.signal.aborted) setState({ requestKey, items, isLoading: false, error: "" });
      } catch (error) {
        if (!controller.signal.aborted && generation.current === version)
          setState({ requestKey, items: [], isLoading: false, error: message(error) });
      }
    }
    load();
    return () => {
      controller.abort();
      generation.current = version + 1;
    };
  }, [sessionId, requestKey]);

  /** 후보 제외 후 목록 갱신 */
  async function exclude(restaurantId, reason) {
    if (busy.current || state.requestKey !== requestKey) return false;
    busy.current = true;
    setIsExcluding(true);
    const version = generation.current;
    try {
      const session = await excludeRecommendation(sessionId, restaurantId, reason);
      const items = await hydrate(session.items);
      if (generation.current !== version) return false;
      setState({ requestKey, items, isLoading: false, error: "" });
      return true;
    } catch (error) {
      if (generation.current === version) setState((prev) => ({ ...prev, error: message(error) }));
      return false;
    } finally {
      busy.current = false;
      setIsExcluding(false);
    }
  }

  const currentState = state.requestKey === requestKey ? state : { items: [], isLoading: true, error: "" };
  return { ...currentState, isExcluding, exclude, retry: () => setAttempt((value) => value + 1) };
}

/** 카드 사진 조회 */
async function hydrate(items, signal) {
  return Promise.all(
    items.map(async (item) => {
      try {
        const detail = await getRestaurant(item.restaurantId, signal);
        return { ...detail, ...item, id: item.restaurantId };
      } catch {
        return { ...item, id: item.restaurantId, image: null };
      }
    }),
  );
}

/** 추천 오류 안내 */
function message(error) {
  if (error.response?.status === 401) return "로그인이 필요해요.";
  if (error.response?.status === 404 || error.message === "MISSING_SESSION")
    return "추천 세션을 찾을 수 없어요. 다시 추천받아주세요.";
  return "추천을 불러오지 못했어요. 다시 시도해주세요.";
}
