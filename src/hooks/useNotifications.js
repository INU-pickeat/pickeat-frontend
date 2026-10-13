import { useEffect, useState } from "react";
import { getNotifications } from "../api/notifications";
import { getApiErrorMessage } from "../utils/apiError";

/** 좋아요 알림 로딩 및 재시도 */
export default function useNotifications() {
  const [state, setState] = useState({ notifications: [], isLoading: true, error: "", needsLogin: false, loadedAt: 0 });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    getNotifications(controller.signal)
      .then((notifications) => {
        if (!controller.signal.aborted)
          setState({ notifications, isLoading: false, error: "", needsLogin: false, loadedAt: Date.now() });
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        const needsLogin = error.response?.status === 401;
        setState({
          notifications: [],
          isLoading: false,
          error: getApiErrorMessage(error, needsLogin ? "로그인이 필요합니다." : "알림을 불러오지 못했어요."),
          needsLogin,
          loadedAt: 0,
        });
      });
    return () => controller.abort();
  }, [attempt]);

  return {
    ...state,
    retry: () => {
      setState((previous) => ({ ...previous, notifications: [], isLoading: true, error: "", needsLogin: false }));
      setAttempt((value) => value + 1);
    },
  };
}
