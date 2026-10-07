import { useEffect, useState } from "react";
import { getPickCalendar } from "../api/picks";

/** 월별 캘린더 로딩 및 재시도 */
export default function usePickCalendar(year, month) {
  const period = `${year}-${month}`;
  const [state, setState] = useState({ period: null, dates: [], error: "", needsLogin: false });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    getPickCalendar({ year, month, signal: controller.signal }).then((dates) => {
      if (!controller.signal.aborted) setState({ period, dates, error: "", needsLogin: false });
    }).catch((error) => {
      if (controller.signal.aborted) return;
      const needsLogin = error.response?.status === 401;
      setState({ period, dates: [], needsLogin, error: needsLogin ? "로그인이 필요해요. 다시 로그인해주세요." : "캘린더를 불러오지 못했어요." });
    });
    return () => controller.abort();
  }, [year, month, period, attempt]);

  /** 조회 재시도 */
  const retry = () => {
    setState({ period: null, dates: [], error: "", needsLogin: false });
    setAttempt((previous) => previous + 1);
  };

  const isLoading = state.period !== period;
  return { dates: isLoading ? [] : state.dates, error: isLoading ? "" : state.error, needsLogin: !isLoading && state.needsLogin, isLoading, retry };
}
