import { useEffect, useState } from "react";
import { getMyPicks } from "../api/picks";

/** 기간별 Pick 로딩 및 재시도 */
export default function useMyPicks(period = "week") {
  const [state, setState] = useState({ period: null, restaurants: [], error: "", needsLogin: false });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    getMyPicks({ period, signal: controller.signal })
      .then((restaurants) => {
        if (!controller.signal.aborted) setState({ period, restaurants, error: "", needsLogin: false });
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        const needsLogin = error.response?.status === 401;
        setState({
          period,
          restaurants: [],
          needsLogin,
          error: needsLogin ? "다시 로그인해주세요." : "최근 Pick을 불러오지 못했어요.",
        });
      });
    return () => controller.abort();
  }, [period, attempt]);

  /** 조회 재시도 */
  const retry = () => {
    setState({ period: null, restaurants: [], error: "", needsLogin: false });
    setAttempt((previous) => previous + 1);
  };
  const isLoading = state.period !== period;
  return {
    restaurants: isLoading ? [] : state.restaurants,
    error: isLoading ? "" : state.error,
    needsLogin: !isLoading && state.needsLogin,
    isLoading,
    retry,
  };
}
