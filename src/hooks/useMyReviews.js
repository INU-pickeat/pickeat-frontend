import { useEffect, useState } from "react";
import { getMyReviews } from "../api/reviews";
import { getApiErrorMessage } from "../utils/apiError";

/** 기간별 내 후기 목록 */
export default function useMyReviews(period) {
  const [state, setState] = useState({ period: null, reviews: [], error: "", needsLogin: false });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    getMyReviews({ period, signal: controller.signal })
      .then((reviews) => {
        if (!controller.signal.aborted) setState({ period, reviews, error: "", needsLogin: false });
      })
      .catch((error) => {
        if (!controller.signal.aborted)
          setState({
            period,
            reviews: [],
            error: getApiErrorMessage(error, "기록을 불러오지 못했어요."),
            needsLogin: error.response?.status === 401,
          });
      });
    return () => controller.abort();
  }, [period, attempt]);

  const isLoading = state.period !== period;

  return {
    reviews: isLoading ? [] : state.reviews,
    error: isLoading ? "" : state.error,
    needsLogin: !isLoading && state.needsLogin,
    isLoading,
    retry: () => {
      setState({ period: null, reviews: [], error: "", needsLogin: false });
      setAttempt((value) => value + 1);
    },
  };
}
