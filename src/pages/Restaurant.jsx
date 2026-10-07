import { useState } from "react";
import { Link, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import RestaurantDetail from "../components/RestaurantDetail";
import { findRestaurant } from "../data/restaurants";
import useDiscoverySpots from "../hooks/useDiscoverySpots";

const actionClassName =
  "flex-1 rounded-full bg-[#FF9639] px-4 py-2 text-[14px] font-bold text-white cursor-pointer active:scale-95 transition-transform";

export default function Restaurant() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isRecommendation = searchParams.get("source") === "recommend";
  const { spots, isLoading, error, retry } = useDiscoverySpots(!isRecommendation);
  const restaurant = isRecommendation
    ? findRestaurant(id)
    : spots.flatMap((spot) => spot.restaurants).find((item) => String(item.id) === id);

  if (!isRecommendation && (isLoading || error)) {
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
  const fallback = isRecommendation ? "/recommend/result" : `/explore/${restaurant.region}`;
  const returnTo = location.state?.returnTo || fallback;

  // pick 지도에 저장
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

  // URL 공유
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
      restaurant={restaurant}
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
            onClick={() =>
              navigate("/recommend/complete", {
                state: { ...location.state?.recommendationState, selectedRestaurant: restaurant },
              })
            }
            className={actionClassName}
          >
            여기로 선택할게요
          </button>
        )
      }
    />
  );
}
