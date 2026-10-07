import { useEffect, useRef, useState } from "react";
import { getFeed, addReviewLike, cancelReviewLike } from "../api/feed";

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
  const pendingLikesRef = useRef(new Set());
  const [pendingLikeIds, setPendingLikeIds] = useState([]);
  const [likeErrors, setLikeErrors] = useState({});

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
    pendingLikesRef.current.clear();
    setPendingLikeIds([]);
    setLikeErrors({});
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

  /** 좋아요 전환 및 서버 상태 반영 */
  const toggleLike = async (reviewId) => {
    const controller = controllerRef.current;
    const review = state.items.find((item) => item.id === reviewId);
    if (!controller || controller.signal.aborted || pendingLikesRef.current.has(reviewId) || !review) return;
    pendingLikesRef.current.add(reviewId);
    setPendingLikeIds((previous) => [...previous, reviewId]);
    setLikeErrors((previous) => ({ ...previous, [reviewId]: "" }));
    try {
      const result = await (review.liked ? cancelReviewLike : addReviewLike)(reviewId, controller.signal);
      if (controller.signal.aborted) return;
      setState((previous) => ({
        ...previous,
        items: previous.items.map((item) =>
          item.id === reviewId ? { ...item, liked: result.liked, likeCount: result.likeCount } : item,
        ),
      }));
    } catch (error) {
      if (controller.signal.aborted) return;
      const status = error.response?.status;
      const message =
        status === 401
          ? "다시 로그인한 후 시도해주세요."
          : status === 409
            ? "비공개 후기에는 좋아요를 누를 수 없어요."
            : status === 404
              ? "삭제되었거나 공개되지 않은 후기예요."
              : "좋아요를 변경하지 못했어요. 다시 눌러주세요.";
      setLikeErrors((previous) => ({ ...previous, [reviewId]: message }));
    } finally {
      if (!controller.signal.aborted) {
        pendingLikesRef.current.delete(reviewId);
        setPendingLikeIds((previous) => previous.filter((id) => id !== reviewId));
      }
    }
  };

  return { ...state, retry, loadMore, toggleLike, pendingLikeIds, likeErrors };
}
