import { useEffect, useState } from "react";
import { getMyInfo } from "../api/member";

/** 내 정보 로딩 및 재시도 */
export default function useMyInfo() {
  const [state, setState] = useState({ member: null, isLoading: true, error: "", needsLogin: false });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    getMyInfo(controller.signal)
      .then((member) => {
        if (!controller.signal.aborted) setState({ member, isLoading: false, error: "", needsLogin: false });
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        const status = error.response?.status;
        const needsLogin = status === 401 || status === 404;
        const message =
          status === 404
            ? "회원 정보를 찾을 수 없어요. 다시 로그인해주세요."
            : status === 401
              ? "다시 로그인해주세요."
              : "내 정보를 불러오지 못했어요.";
        setState({ member: null, isLoading: false, error: message, needsLogin });
      });
    return () => controller.abort();
  }, [attempt]);

  /** 조회 재시도 */
  const retry = () => {
    setState({ member: null, isLoading: true, error: "", needsLogin: false });
    setAttempt((previous) => previous + 1);
  };

  return { ...state, retry };
}
