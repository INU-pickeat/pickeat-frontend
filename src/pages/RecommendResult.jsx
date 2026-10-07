import { useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import PageTransition from "../components/PageTransition";
import LeftArrow from "../assets/arrow_left.svg";
import useRecommendation from "../hooks/useRecommendation";
import { foodNames } from "../api/recommendations";
import { getNickname } from "../api/tokenStorage";

const reasons = [
  ["DISTANCE_TOO_FAR", "거리가 멀어요."],
  ["PRICE_TOO_HIGH", "가격이 높아요."],
  ["MENU_UNSATISFACTORY", "메뉴가 아쉬워요."],
  ["ATMOSPHERE_MISMATCH", "분위기가 달라요."],
  ["WANT_DIFFERENT", "다른 곳을 볼래요."],
];

export default function RecommendResult() {
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const { items, isLoading, error, isExcluding, exclude, retry } = useRecommendation(params.get("sessionId"));
  const [target, setTarget] = useState(null);
  const [step, setStep] = useState("confirm");
  const [reason, setReason] = useState("");

  /** 제외 모달 닫기 */
  function close() {
    if (isExcluding) return;
    setTarget(null);
    setStep("confirm");
    setReason("");
  }

  /** 식당 제외 */
  async function handleExclude() {
    if (await exclude(target, reason)) {
      setTarget(null);
      setStep("confirm");
      setReason("");
    }
  }

  return (
    <PageTransition className="min-h-dvh w-full bg-[#FFFDF8] relative overflow-x-hidden overflow-y-auto scrollbar-none">
      {/* 배경 그라데이션 */}
      <div className="fixed top-0 -right-10 w-60 h-60 bg-[#F87816] rounded-full blur-[40px] opacity-60 -translate-y-1/4 translate-x-1/4 pointer-events-none" />
      <div className="fixed top-1/2 left-0 w-60 h-60 bg-[#F87816] rounded-full blur-[40px] opacity-60 -translate-y-1/2 -translate-x-1/4 pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-60 h-60 bg-[#F87816] rounded-full blur-[40px] opacity-60 translate-y-1/4 translate-x-1/4 pointer-events-none" />
      {/* 뒤로가기 & 추천 제목 */}
      <header className="pt-12 px-8 pb-4 relative z-10 mb-8">
        <button onClick={() => navigate("/home")} className="mb-5">
          <img src={LeftArrow} alt="뒤로가기" className="w-6 h-6" />
        </button>
        <h1 className="text-[24px] font-bold text-[#F86516] leading-snug">
          {getNickname() || "픽잇"}님의 선택
          <br />
          {location.state?.neighborhood || "선택한 지역"} 추천 맛집
        </h1>
      </header>
      {/* 추천 목록 */}
      <div className="px-6 pb-14 flex flex-col gap-4 relative">
        {/* 로딩·오류·빈 결과 안내 */}
        {isLoading && <p role="status">추천을 불러오는 중이에요.</p>}
        {error && (
          <div className="text-center">
            <p role="alert">{error}</p>
            <button onClick={retry} className="mt-3 text-[#F86516] underline">
              다시 조회
            </button>
            <button onClick={() => navigate("/location")} className="ml-4 text-[#F86516] underline">
              조건 다시 선택하기
            </button>
            {error === "로그인이 필요해요." && (
              <button onClick={() => navigate("/")} className="ml-4 text-[#F86516] underline">
                로그인하기
              </button>
            )}
          </div>
        )}
        {!isLoading && !error && items.length === 0 && (
          <div className="text-center">
            <p>조건에 맞는 맛집이 없어요.</p>
            <button onClick={() => navigate("/location")} className="mt-3 text-[#F86516] underline">
              조건 다시 선택하기
            </button>
          </div>
        )}
        {/* 식당 카드 */}
        {items.map((restaurant) => (
          <div
            key={restaurant.id}
            className="relative w-full h-[210px] rounded-[24px] overflow-hidden bg-[#9A7759] shadow-[0_8px_20px_rgba(0,0,0,0.08)] group"
          >
            {/* 식당 사진·순위·이름 & 상세보기 */}
            <button
              className="absolute inset-0 w-full text-left"
              onClick={() =>
                navigate(`/restaurant/${restaurant.id}?source=recommend`, {
                  state: { returnTo: location.pathname + location.search, recommendationState: location.state },
                })
              }
              aria-label={`${restaurant.name} 상세보기`}
            >
              {restaurant.image && (
                <img
                  src={restaurant.image}
                  alt=""
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                  }}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10" />
              <span className="absolute top-6 left-6 w-7 h-7 bg-[#F86516] text-white rounded-full flex items-center justify-center text-[14px] font-bold">
                {restaurant.rank}
              </span>
              <span className="absolute bottom-6 left-6 flex flex-col text-[#FFFBF2]">
                <span className="text-[18px] font-extrabold mb-1">{restaurant.name}</span>
                <span className="text-[12px] font-medium">
                  {foodNames[restaurant.foodCategory] || restaurant.foodCategory}
                </span>
              </span>
            </button>
            {/* 다른 식당 추천 버튼 */}
            <button
              onClick={() => setTarget(restaurant.id)}
              className="absolute top-6 right-6 bg-[#FFFDF8] text-[#434343] text-[10px] font-medium px-3 py-1.5 rounded-full shadow-sm"
            >
              다른 식당으로 추천
            </button>
          </div>
        ))}
      </div>
      {/* 제외 확인 & 사유 선택 모달 */}
      {target != null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="exclude-title"
        >
          <div className="w-full max-w-md bg-[#FFFDF8] border-2 border-[#FF8223] rounded-[24px] p-8 flex flex-col items-center">
            <h2 id="exclude-title" className="text-[#F87816] font-bold text-[18px] mb-4 text-center">
              {step === "confirm" ? "이 맛집을 추천에서 제외할까요?" : "이 추천 맛집이 아쉬운 이유가 있나요?"}
            </h2>
            {/* 제외 안내 또는 사유 목록 */}
            {step === "confirm" ? (
              <p className="text-[#434343] text-[14px] text-center leading-relaxed mb-6">
                선택한 맛집을 현재 추천 목록에서 제외하고 새로운 맛집을 추천해드릴게요.
              </p>
            ) : (
              <div className="w-full flex flex-col gap-3.5 mb-8">
                {reasons.map(([value, label]) => (
                  <label key={value} className="flex justify-between items-center text-[14px] text-[#434343]">
                    <span>{label}</span>
                    <input
                      type="radio"
                      name="reason"
                      value={value}
                      checked={reason === value}
                      onChange={() => setReason(value)}
                      disabled={isExcluding}
                      className="w-6 h-6 accent-[#FF9639]"
                    />
                  </label>
                ))}
              </div>
            )}
            {error && (
              <p role="alert" className="mb-4 text-sm">
                {error}
              </p>
            )}
            {/* 취소 & 제외 버튼 */}
            <div className="flex w-full gap-5">
              <button
                onClick={close}
                disabled={isExcluding}
                className="flex-1 bg-[#FFECCD] text-[#FF8223] py-3.5 rounded-full text-[14px]"
              >
                취소
              </button>
              <button
                disabled={isExcluding || (step === "reason" && !reason)}
                onClick={() => (step === "confirm" ? setStep("reason") : handleExclude())}
                className="flex-1 bg-[#FF9639] text-white py-3.5 rounded-full text-[14px] disabled:opacity-50"
              >
                {isExcluding ? "제외 중..." : "제외하기"}
              </button>
            </div>
          </div>
        </div>
      )}
    </PageTransition>
  );
}
