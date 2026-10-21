import { selectedDateLabel } from "../utils/reviewDisplay";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageTransition from "../components/common/PageTransition";
import BottomNav from "../components/layout/BottomNav";
import LeftArrow from "../assets/icons/arrow_left.svg";
import useMyPicks from "../hooks/useMyPicks";
import SwipeablePickCard from "../components/pick/SwipeablePickCard";
import DeletePickDialog from "../components/pick/DeletePickDialog";
import { deleteRestaurantPicks } from "../api/picks";
import { getApiErrorMessage } from "../utils/apiError";

export default function Recent() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("일주일 기준");
  const [openRestaurantId, setOpenRestaurantId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const deleteRequest = useRef(null);

  useEffect(() => () => deleteRequest.current?.abort(), []);

  /** 삭제 취소 후 카드 복원 */
  const closeDelete = () => {
    if (deleteRequest.current) return;
    setDeleteTarget(null);
    setOpenRestaurantId(null);
    setDeleteError("");
  };

  const navigate = useNavigate();

  /** 기간 선택 */
  const handleSelectFilter = (filter) => {
    setSelectedFilter(filter);
    setIsDropdownOpen(false);
    setOpenRestaurantId(null);
    setDeleteTarget(null);
  };

  const {
    restaurants: picksData,
    isLoading,
    error,
    needsLogin,
    retry,
  } = useMyPicks(selectedFilter === "일주일 기준" ? "week" : "month");

  /** 삭제 후 서버의 식당별 집계 다시 조회 */
  const confirmDelete = async () => {
    if (!deleteTarget || deleteRequest.current) return;
    const controller = new AbortController();
    deleteRequest.current = controller;
    setIsDeleting(true);
    setDeleteError("");
    try {
      await deleteRestaurantPicks(deleteTarget.restaurantId, controller.signal);
      if (controller.signal.aborted) return;
      setDeleteTarget(null);
      setOpenRestaurantId(null);
      retry();
    } catch (error) {
      if (!controller.signal.aborted)
        setDeleteError(
          getApiErrorMessage(
            error,
            error.response?.status === 409
              ? "기록을 작성한 Pick만 남아 있어요. 기록을 먼저 삭제해주세요."
              : error.response?.status === 404
                ? "삭제할 Pick이 없어요."
                : error.response?.status === 401
                  ? "로그인이 필요합니다."
                  : "Pick을 삭제하지 못했어요. 다시 시도해주세요.",
          ),
        );
    } finally {
      if (!controller.signal.aborted) setIsDeleting(false);
      deleteRequest.current = null;
    }
  };

  // 날짜별로 데이터 그룹화
  const groupedPicks = picksData.reduce((acc, pick) => {
    const formattedDate = selectedDateLabel(pick.latestPickedAt);
    if (!acc[formattedDate]) {
      acc[formattedDate] = [];
    }
    acc[formattedDate].push(pick);
    return acc;
  }, {});

  return (
    <>
      <PageTransition className="h-dvh w-full flex flex-col relative bg-[#FFFDF8] overflow-hidden">
        <div className="relative z-10 flex-1 overflow-y-auto scrollbar-hide px-6 pt-10 pb-24">
          {/* 뒤로가기 버튼 */}
          <img src={LeftArrow} className="w-6 h-6 mb-6 cursor-pointer" onClick={() => navigate("/home")} />

          {/* 타이틀 & 정렬 토글 */}
          <div className="flex justify-between mb-8">
            <h2 className="text-[22px] font-bold text-[#F86516] leading-none">최근 pick</h2>

            <div className="relative mt-1">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-1 text-[#F87816] active:opacity-60 transition-opacity cursor-pointer"
              >
                <span className="text-[12px] font-semibold leading-none">{selectedFilter}</span>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>

              {/* 드롭다운 메뉴 */}
              {isDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-26 bg-[#FFFDF8] border-[1.5px] border-[#F86516] rounded-xl shadow-lg z-50 flex flex-col overflow-hidden">
                  <button
                    onClick={() => handleSelectFilter("일주일 기준")}
                    className={`py-2 text-[14px] font-bold transition-colors ${selectedFilter === "일주일 기준" ? "text-[#F86516] bg-[#FFECCD]" : "text-[#434343] active:bg-gray-50"}`}
                  >
                    일주일 기준
                  </button>
                  <div className="w-full h-px bg-[#F86516]/30"></div>
                  <button
                    onClick={() => handleSelectFilter("30일 기준")}
                    className={`py-2 text-[14px] font-bold transition-colors ${selectedFilter === "30일 기준" ? "text-[#F86516] bg-[#FFECCD]" : "text-[#434343] active:bg-gray-50"}`}
                  >
                    30일 기준
                  </button>
                </div>
              )}
            </div>
          </div>

          {isLoading && (
            <p role="status" className="exception-glow text-sm text-[#777777]">
              최근 Pick을 불러오는 중이에요.
            </p>
          )}
          {error && (
            <div role="alert" className="exception-glow text-sm text-[#777777]">
              <p>{error}</p>
              {needsLogin ? (
                <Link to="/login" className="mt-3 inline-block text-[#F86516] underline">
                  로그인하기
                </Link>
              ) : (
                <button type="button" onClick={retry} className="mt-3 text-[#F86516] underline cursor-pointer">
                  다시 시도
                </button>
              )}
            </div>
          )}
          {!isLoading && !error && picksData.length === 0 && (
            <p className="exception-message">선택한 기간에 Pick한 맛집이 없어요.</p>
          )}
          {Object.entries(groupedPicks).map(([date, items], index) => (
            <div key={date} className={index > 0 ? "mt-8" : ""}>
              {/* 날짜 헤더 */}
              <h2 className="text-[16px] font-bold text-[#F86516] mb-3">{date}</h2>

              {/* 식당 카드 리스트 */}
              <div className="flex flex-col space-y-4">
                {items.map((item) => (
                  <SwipeablePickCard
                    key={item.restaurantId}
                    pick={item}
                    isOpen={openRestaurantId === item.restaurantId}
                    onOpen={() => {
                      setOpenRestaurantId(item.restaurantId);
                      setDeleteTarget(item);
                      setDeleteError("");
                    }}
                    onClose={() => setOpenRestaurantId(null)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </PageTransition>

      {/* 네비게이션 바 */}
      <BottomNav />
      {deleteTarget && (
        <DeletePickDialog onClose={closeDelete} onConfirm={confirmDelete} isDeleting={isDeleting} error={deleteError} />
      )}
    </>
  );
}
