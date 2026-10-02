import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import PageTransition from "../components/PageTransition";
import LeftArrow from "../assets/arrow_left.svg";

// 더미데이터
const mockRestaurants = [
  {
    id: 1,
    rank: 1,
    name: "앙지인띠",
    category: "중식",
    image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: 2,
    rank: 2,
    name: "푸드득현",
    category: "중식",
    image: "https://images.unsplash.com/photo-1525648199074-cee30ba79a4a?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: 3,
    rank: 3,
    name: "임성우바보",
    category: "중식",
    image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: 4,
    rank: 4,
    name: "더미4",
    category: "중식",
    image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: 5,
    rank: 5,
    name: "더미5",
    category: "중식",
    image: "https://images.unsplash.com/photo-1525648199074-cee30ba79a4a?q=80&w=600&auto=format&fit=crop",
  },
];

// 제외 사유 리스트
const exclusionReasons = [
  "카테고리가 달라요.",
  "거리가 멀어요.",
  "가격이 높아요.",
  "메뉴가 별로예요.",
  "분위기가 달라요.",
  "그냥 다른 곳을 원해요.",
];

export default function RecommendResult() {
  const navigate = useNavigate();
  const location = useLocation();

  // 모달 관련 상태
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isReasonModalOpen, setIsReasonModalOpen] = useState(false);
  const [targetRestaurantId, setTargetRestaurantId] = useState(null); // 제외할 식당 ID 저장
  const [selectedReason, setSelectedReason] = useState(""); // 선택된 제외 사유

  // 모달 닫기 및 상태 초기화 함수
  const closeModal = () => {
    setIsConfirmModalOpen(false);
    setIsReasonModalOpen(false);
    setTargetRestaurantId(null);
    setSelectedReason("");
  };

  // 최종 제외 처리 함수
  const handleExclude = () => {
    closeModal();
    alert("서버 연동 구현 예정입니다.");
  };

  // 이전 페이지들에서 넘겨받은 데이터 파싱 (없을 경우 기본값)
  const userName = "픽잇";
  const neighborhood = location.state?.neighborhood || "혜화동";

  // 서버 연동 전 하드코딩
  const categoryName = "중식";

  return (
    <PageTransition className="min-h-dvh w-full bg-[#FFFDF8] relative overflow-x-hidden overflow-y-auto scrollbar-none">
      {/* 배경 그라데이션 */}
      <div className="fixed top-0 -right-10 w-60 h-60 bg-[#F87816] rounded-full blur-[40px] opacity-60 -translate-y-1/4 translate-x-1/4 pointer-events-none z-0" />{" "}
      <div className="fixed top-1/2 left-0 w-60 h-60 bg-[#F87816] rounded-full blur-[40px] opacity-60 -translate-y-1/2 -translate-x-1/4 pointer-events-none z-0" />{" "}
      <div className="fixed bottom-0 right-0 w-60 h-60 bg-[#F87816] rounded-full blur-[40px] opacity-60 translate-y-1/4 translate-x-1/4 pointer-events-none z-0" />{" "}
      {/* 헤더 영역 */}
      <div className="pt-12 px-8 pb-4 relative z-10 mb-8">
        <img
          src={LeftArrow}
          alt="뒤로가기"
          className="w-6 h-6 mb-5 cursor-pointer block"
          onClick={() => navigate("/home")}
        />

        {/* 상단 텍스트 영역 */}
        <h1 className="text-[24px] font-bold text-[#F86516] leading-snug">
          {userName}님의 선택
          <br />
          {neighborhood} {categoryName} 추천 맛집 Top 5
        </h1>
      </div>
      {/* 카드 리스트 영역 */}
      <div className="px-6 pb-14 flex flex-col gap-4 relative">
        {mockRestaurants.map((restaurant) => (
          <div
            key={restaurant.id}
            onClick={() => navigate(`/restaurant/${restaurant.id}`)}
            className="relative w-full h-[210px] rounded-[24px] overflow-hidden shadow-[0_8px_20px_rgba(0,0,0,0.08)] group cursor-pointer"
          >
            {/* 식당 배경 이미지 */}
            <img
              src={restaurant.image}
              alt={restaurant.name}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10" />

            {/* 번호 뱃지 */}
            <div className="absolute top-6 left-6 w-7 h-7 bg-[#F86516] text-white rounded-full flex items-center justify-center text-[14px] font-bold shadow-md">
              {restaurant.rank}
            </div>

            {/* 다른 식당 추천 버튼 */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setTargetRestaurantId(restaurant.id);
                setIsConfirmModalOpen(true);
              }}
              className="absolute top-6 right-6 bg-[#FFFDF8] text-[#434343] text-[10px] font-medium px-3 py-1.5 rounded-full shadow-sm active:scale-95 transition-transform"
            >
              다른 식당으로 추천
            </button>

            {/* 식당 정보 */}
            <div className="absolute bottom-6 left-6 flex flex-col">
              <span className="text-[#FFFBF2] text-[18px] font-extrabold mb-1">{restaurant.name}</span>
              <span className="text-[#FFFBF2] text-[12px] font-medium">{restaurant.category}</span>
            </div>
          </div>
        ))}
      </div>
      {/* 제외 확인 모달 */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-6 ">
          <div className="w-full bg-[#FFFDF8] border-2 border-[#FF8223] rounded-[24px] p-8 flex flex-col items-center animate-fade-in-up">
            <h2 className="text-[#F87816] font-bold text-[18px] mb-4">이 맛집을 추천에서 제외할까요?</h2>
            <p className="text-[#434343] text-[14px] text-center leading-relaxed font-medium mb-6">
              선택한 맛집을 현재 추천 목록에서 제외하고
              <br />
              새로운 맛집을 추천해드릴게요.
            </p>
            <div className="flex w-[85%] gap-5">
              <button
                onClick={closeModal}
                className="flex-1 bg-[#FFECCD] text-[#FF8223] font-medium py-3.5 rounded-full text-[14px]"
              >
                취소
              </button>
              <button
                onClick={() => {
                  setIsConfirmModalOpen(false);
                  setIsReasonModalOpen(true);
                }}
                className="flex-1 bg-[#FF9639] text-white font-medium py-3.5 rounded-full text-[14px]"
              >
                제외하기
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 사유 선택 모달 */}
      {isReasonModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-6 ">
          <div className="w-full bg-[#FFFDF8] border-2 border-[#FF8223] rounded-[24px] p-8 flex flex-col items-center animate-fade-in-up">
            <h2 className="text-[#F87816] font-bold text-[18px] mb-4 break-keep">
              이 추천 맛집이 아쉬운 이유가 있나요?
            </h2>
            {/* 사유 리스트 렌더링 */}
            <div className="w-full flex flex-col gap-3.5  mb-8">
              {exclusionReasons.map((reason) => (
                <div
                  key={reason}
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => setSelectedReason(reason)}
                >
                  <span
                    className={`text-[14px] font-medium ${selectedReason === reason ? "text-[#434343] font-semibold" : "text-[#434343]"}`}
                  >
                    {reason}
                  </span>
                  <div
                    className={`w-6 h-6 rounded-full transition-colors ${selectedReason === reason ? "bg-[#FF9639]" : "bg-[#FFECCD]"}`}
                  />
                </div>
              ))}
            </div>
            <div className="flex w-[85%] gap-5">
              <button
                onClick={closeModal}
                className="flex-1 bg-[#FFECCD] text-[#FF8223] font-medium py-3.5 rounded-full text-[14px]"
              >
                취소
              </button>
              <button
                onClick={handleExclude}
                disabled={!selectedReason}
                className={`flex-1 font-medium py-3.5 rounded-full text-[14px] transition-colors ${
                  selectedReason ? "bg-[#FF9639] text-white" : "bg-[#FF9639]/50 text-white/80 cursor-not-allowed"
                }`}
              >
                제외하기
              </button>
            </div>
          </div>
        </div>
      )}
    </PageTransition>
  );
}
