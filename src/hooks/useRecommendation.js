import { useEffect, useRef, useState } from "react";
import { getRecommendation, excludeRecommendation, createRecommendation } from "../api/recommendations";

/** 추천 목록 조회 및 제외 */
export default function useRecommendation(sessionId) {
  const [state, setState] = useState({ items: [], isLoading: true, error: "" });
  const [attempt, setAttempt] = useState(0);
  const [isExcluding, setIsExcluding] = useState(false);
  const [isChangingRadius, setIsChangingRadius] = useState(false);
  const radiusRequest = useRef(null);
  const createdSession = useRef(null);
  const busy = useRef(false);
  const generation = useRef(0);
  const requestKey = `${sessionId}:${attempt}`;

  useEffect(() => {
    const controller = new AbortController();
    const version = ++generation.current;
    async function load() {
      try {
        if (!sessionId) throw new Error("MISSING_SESSION");
        const session =
          String(createdSession.current?.sessionId) === String(sessionId)
            ? createdSession.current
            : await getRecommendation(sessionId, controller.signal);
        createdSession.current = null;
        if (!controller.signal.aborted) setState({ ...session, requestKey, isLoading: false, error: "" });
      } catch (error) {
        if (!controller.signal.aborted && generation.current === version)
          setState({ requestKey, items: [], isLoading: false, error: message(error) });
      }
    }
    load();
    return () => {
      controller.abort();
      radiusRequest.current?.abort();
      generation.current = version + 1;
    };
  }, [sessionId, requestKey]);

  /** 현재 결과를 유지하면서 새 반경 세션 생성 */
  async function changeRadius(body) {
    if (busy.current || state.requestKey !== requestKey) return null;
    busy.current = true;
    setIsChangingRadius(true);
    setState((previous) => ({ ...previous, error: "" }));
    const controller = new AbortController();
    radiusRequest.current = controller;
    const version = generation.current;
    try {
      const session = await createRecommendation(body, controller.signal);
      if (controller.signal.aborted || generation.current !== version) return null;
      createdSession.current = session;
      setState({ ...session, requestKey: `${session.sessionId}:${attempt}`, isLoading: false, error: "" });
      return session;
    } catch (error) {
      if (!controller.signal.aborted && generation.current === version)
        setState((previous) => ({ ...previous, error: message(error) }));
      return null;
    } finally {
      busy.current = false;
      setIsChangingRadius(false);
    }
  }

  /** 후보 제외 후 목록 갱신 */
  async function exclude(restaurantId, reason) {
    if (busy.current || state.requestKey !== requestKey) return false;
    busy.current = true;
    setIsExcluding(true);
    const version = generation.current;
    try {
      const session = await excludeRecommendation(sessionId, restaurantId, reason);
      if (generation.current !== version) return false;
      setState({ ...session, requestKey, isLoading: false, error: "" });
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
  return {
    ...currentState,
    isExcluding,
    isChangingRadius,
    changeRadius,
    exclude,
    retry: () => setAttempt((value) => value + 1),
  };
}

/** 추천 오류 안내 */
function message(error) {
  if (error.response?.status === 401) return "로그인이 필요해요.";
  if (error.response?.status === 404 || error.message === "MISSING_SESSION")
    return "추천 세션을 찾을 수 없어요. 다시 추천받아주세요.";
  return "추천을 불러오지 못했어요. 다시 시도해주세요.";
}
