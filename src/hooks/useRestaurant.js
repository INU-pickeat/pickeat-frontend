import { useEffect, useState } from "react";
import { getRestaurant, getRestaurantReviewSummary } from "../api/restaurants";
import { getApiErrorMessage } from "../utils/apiError";

/** 식당 상세 로딩 */
export default function useRestaurant(id) {
  const [state, setState] = useState({ id: null, restaurant: null, error: "" });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    getRestaurant(id, controller.signal)
      .then(async (restaurant) => {
        const summary = typeof restaurant.review === "string" ? null : await getRestaurantReviewSummary(id, controller.signal).catch((error) => ({
          oneLineReview: getApiErrorMessage(error, "한줄평을 불러오지 못했어요."),
        }));
        if (!controller.signal.aborted)
          setState({
            id,
            restaurant: {
              ...restaurant,
              review: restaurant.review ?? summary?.oneLineReview,
              reviewCount: summary?.reviewCount,
            },
            error: "",
          });
      })
      .catch((error) => {
        if (!controller.signal.aborted)
          setState({
            id,
            restaurant: null,
            error: error.response?.status === 404 ? "식당 정보를 찾을 수 없어요." : "식당 정보를 불러오지 못했어요.",
          });
      });
    return () => controller.abort();
  }, [id, attempt]);
  return {
    restaurant: state.id === id ? state.restaurant : null,
    error: state.id === id ? state.error : "",
    isLoading: state.id !== id,
    retry: () => {
      setState({ id: null, restaurant: null, error: "" });
      setAttempt((value) => value + 1);
    },
  };
}
