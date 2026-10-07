import { useEffect, useState } from "react";
import { getDiscoverySpots } from "../api/discovery";

/** 탐색 스팟 로딩 및 재시도 */
export default function useDiscoverySpots(enabled = true) {
  const [state, setState] = useState({ spots: [], isLoading: enabled, error: "" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    getDiscoverySpots(controller.signal)
      .then((spots) => {
        if (!controller.signal.aborted) setState({ spots, isLoading: false, error: "" });
      })
      .catch(() => {
        if (!controller.signal.aborted)
          setState({ spots: [], isLoading: false, error: "맛집 정보를 불러오지 못했어요." });
      });
    return () => controller.abort();
  }, [attempt, enabled]);

  /** 조회 재시도 */
  const retry = () => {
    setState({ spots: [], isLoading: true, error: "" });
    setAttempt((previous) => previous + 1);
  };

  return { ...state, retry };
}
