import { useEffect, useRef, useState } from "react";
import { getFeed } from "../api/feed";

/** 피드 조회 및 페이지 추가 */
export default function useFeed() {
  const [state, setState] = useState({
    items: [],
    nextCursor: null,
    isLoading: true,
    isLoadingMore: false,
    error: "",
    needsLogin: false,
  });
  const [attempt, setAttempt] = useState(0);
  const controllerRef = useRef(null);
  const loadingMoreRef = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    controllerRef.current = controller;
    getFeed({ signal: controller.signal })
      .then((page) => {
        if (!controller.signal.aborted)
          setState({ ...page, isLoading: false, isLoadingMore: false, error: "", needsLogin: false });
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        const needsLogin = error.response?.status === 401;
        setState({
          items: [],
          nextCursor: null,
          isLoading: false,
          isLoadingMore: false,
          needsLogin,
          error: needsLogin ? "다시 로그인해주세요." : "피드를 불러오지 못했어요.",
        });
      });
    return () => controller.abort();
  }, [attempt]);

  /** 첫 페이지 재시도 */
  const retry = () => {
    controllerRef.current?.abort();
    loadingMoreRef.current = false;
    setState({ items: [], nextCursor: null, isLoading: true, isLoadingMore: false, error: "", needsLogin: false });
    setAttempt((previous) => previous + 1);
  };

  /** 다음 페이지 조회 */
  const loadMore = async () => {
    const controller = controllerRef.current;
    if (
      !controller ||
      controller.signal.aborted ||
      state.isLoading ||
      loadingMoreRef.current ||
      state.nextCursor === null
    )
      return;
    loadingMoreRef.current = true;
    setState((previous) => ({ ...previous, isLoadingMore: true, error: "" }));

    try {
      const page = await getFeed({ cursor: state.nextCursor, signal: controller.signal });
      if (controller.signal.aborted) return;
      setState((previous) => {
        const ids = new Set(previous.items.map((item) => item.id));
        return {
          ...previous,
          items: [...previous.items, ...page.items.filter((item) => !ids.has(item.id))],
          nextCursor: page.nextCursor,
          isLoadingMore: false,
        };
      });
    } catch (error) {
      if (controller.signal.aborted) return;
      const needsLogin = error.response?.status === 401;
      setState((previous) => ({
        ...previous,
        isLoadingMore: false,
        needsLogin,
        error: needsLogin ? "다시 로그인해주세요." : "다음 후기를 불러오지 못했어요. 다시 시도해주세요.",
      }));
    } finally {
      if (!controller.signal.aborted) loadingMoreRef.current = false;
    }
  };

  return { ...state, retry, loadMore };
}
