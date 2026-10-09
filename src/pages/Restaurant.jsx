import { useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import RestaurantDetail from "../components/RestaurantDetail";
import useRestaurant from "../hooks/useRestaurant";
import { createPick } from "../api/picks";
import { getApiErrorMessage } from "../utils/apiError";

const actionClassName =
  "flex-1 rounded-full bg-[#FF9639] px-4 py-2 text-[14px] font-bold text-white cursor-pointer active:scale-95 transition-transform";

const situationNames = {
  date: "데이트",
  family: "가족과 함께",
  kids: "아이와 함께",
  solo: "혼밥",
  group: "단체",
  pet: "반려견과 함께",
};

export default function Restaurant() {
  const { id } = useParams();
  const { restaurant, isLoading, error, retry } = useRestaurant(id);

  if (isLoading || error) {
    return (
      <div className="min-h-dvh bg-[#FFFDF8] px-8 pt-12 text-center">
        <p role={error ? "alert" : "status"}>{error || "식당 정보를 불러오는 중이에요."}</p>
        {error && (
          <button type="button" onClick={retry} className="mt-4 text-[#F86516] underline cursor-pointer">
            다시 시도
          </button>
        )}
        <Link to="/home" className="mt-6 block text-[#F86516]">
          홈으로 돌아가기
        </Link>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-dvh bg-[#FFFDF8] px-8 pt-12 text-center">
        <h1 className="text-xl font-bold text-[#F86516]">식당 정보를 찾을 수 없어요.</h1>
        <Link to="/home" className="mt-6 inline-block text-[#F86516] underline">
          홈으로 돌아가기
        </Link>
      </div>
    );
  }

  return <RestaurantPage key={id} restaurant={restaurant} />;
}

function RestaurantPage({ restaurant }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [feedback, setFeedback] = useState("");
  const [isSelecting, setIsSelecting] = useState(false);
  const selectionInFlight = useRef(false);
  const [saved, setSaved] = useState(() => {
    try {
      const savedRestaurants = JSON.parse(localStorage.getItem("pickeat.savedRestaurants") || "[]");
      return (
        Array.isArray(savedRestaurants) && savedRestaurants.some((item) => String(item.id) === String(restaurant.id))
      );
    } catch {
      return false;
    }
  });
  const isRecommendation = searchParams.get("source") === "recommend";
  const sessionId = searchParams.get("sessionId") || location.state?.recommendationState?.sessionId;
  const selectedSituation = situationNames[location.state?.recommendationState?.situation];
  // 추천 상세에 사용자가 선택한 동행 조건을 표시
  const detailRestaurant = isRecommendation
    ? { ...restaurant, features: selectedSituation ? [selectedSituation] : [] }
    : restaurant;
  const fallback = isRecommendation && sessionId ? `/recommend/result?sessionId=${encodeURIComponent(sessionId)}` : "/home";
  const returnTo = location.state?.returnTo || fallback;

  /** 추천 식당 선택 */
  const selectRestaurant = async () => {
    if (selectionInFlight.current) return;
    const recommendationSessionId = Number(sessionId);
    if (!Number.isSafeInteger(recommendationSessionId) || recommendationSessionId <= 0) {
      setFeedback("추천 결과에서 식당을 다시 선택해주세요.");
      return;
    }
    selectionInFlight.current = true;
    setIsSelecting(true);
    setFeedback("");
    try {
      const pick = await createPick({ recommendationSessionId, restaurantId: restaurant.id });
      navigate("/recommend/complete", {
        replace: true,
        state: {
          ...location.state?.recommendationState,
          sessionId: recommendationSessionId,
          pick,
          selectedRestaurant: { ...restaurant, name: pick.restaurantName },
        },
      });
    } catch (error) {
      setFeedback(getApiErrorMessage(error, "선택을 저장하지 못했어요. 다시 시도해주세요."));
    } finally {
      selectionInFlight.current = false;
      setIsSelecting(false);
    }
  };

  /** 식당 임시 저장 */
  const saveRestaurant = () => {
    try {
      const stored = JSON.parse(localStorage.getItem("pickeat.savedRestaurants") || "[]");
      const savedRestaurants = Array.isArray(stored) ? stored : [];
      if (!savedRestaurants.some((item) => String(item.id) === String(restaurant.id))) {
        localStorage.setItem("pickeat.savedRestaurants", JSON.stringify([...savedRestaurants, restaurant]));
      }
      setSaved(true);
      alert("구현 예정입니다.");
    } catch {
      setFeedback("저장하지 못했어요. 브라우저 저장 공간을 확인해주세요.");
    }
  };

  /** 상세 링크 공유 */
  const shareRestaurant = async () => {
    const url = `${window.location.origin}/restaurant/${restaurant.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: restaurant.name, text: `${restaurant.name} 맛집 정보`, url });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        setFeedback("상세 페이지 링크를 복사했어요.");
      } else {
        alert("구현 예정입니다.");
      }
    } catch (error) {
      if (error.name !== "AbortError") setFeedback(`공유 링크: ${url}`);
    }
  };

  return (
    <RestaurantDetail
      restaurant={detailRestaurant}
      onBack={() => navigate(returnTo, { state: location.state?.recommendationState })}
      feedback={feedback}
      actions={
        !isRecommendation ? (
          <>
            <button
              type="button"
              onClick={saveRestaurant}
              disabled={saved}
              className={`${actionClassName} disabled:opacity-60 disabled:cursor-default`}
            >
              {saved ? "pick 저장 완료" : "pick 지도에 저장"}
            </button>
            <button type="button" onClick={shareRestaurant} className={actionClassName}>
              친구에게 공유
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={selectRestaurant}
            disabled={isSelecting}
            className={`${actionClassName} disabled:opacity-60 disabled:cursor-wait`}
          >
            {isSelecting ? "선택 저장 중..." : "여기로 선택할게요"}
          </button>
        )
      }
    />
  );
}
