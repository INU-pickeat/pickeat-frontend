import { useEffect, useState } from "react";
import { getPickMap } from "../api/picks";

/** 내 Pick 지도 로딩 및 재시도 */
export default function usePickMap() {
  const [state, setState] = useState({ picks: [], isLoading: true, error: "", needsLogin: false });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    getPickMap(controller.signal).then((picks) => {
      if (!controller.signal.aborted) setState({ picks, isLoading: false, error: "", needsLogin: false });
    }).catch((error) => {
      if (controller.signal.aborted) return;
      const needsLogin = error.response?.status === 401;
      setState({ picks: [], isLoading: false, needsLogin, error: needsLogin ? "다시 로그인해주세요." : "Pick을 불러오지 못했어요." });
    });
    return () => controller.abort();
  }, [attempt]);

  /** 조회 재시도 */
  const retry = () => {
    setState({ picks: [], isLoading: true, error: "", needsLogin: false });
    setAttempt((previous) => previous + 1);
  };
  return { ...state, retry };
}
