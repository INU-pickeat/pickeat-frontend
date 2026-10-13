import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageTransition from "../components/common/PageTransition";
import BottomNav from "../components/layout/BottomNav";
import LeftArrow from "../assets/icons/arrow_left.svg";
import DefaultProfile from "../assets/profile_default.png";
import useNotifications from "../hooks/useNotifications";
import { getReview } from "../api/reviews";
import { getApiErrorMessage } from "../utils/apiError";
import { reviewImageUrl, reviewTags } from "../utils/reviewDisplay";
import ReviewModal from "../components/review/ReviewModal";

/** 알림 화면 */
export default function Notifications() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState("week");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { notifications, isLoading, error, needsLogin, loadedAt, retry } = useNotifications();
  const [selectedReview, setSelectedReview] = useState(null);
  const [reviewError, setReviewError] = useState("");
  const [isReviewLoading, setIsReviewLoading] = useState(false);
  const reviewRequest = useRef(null);
  const cutoff = loadedAt - (period === "week" ? 7 : 30) * 24 * 60 * 60 * 1000;
  const visible = notifications.filter((item) => item.type === "REVIEW_LIKE" && Date.parse(item.createdAt) >= cutoff);

  useEffect(() => () => reviewRequest.current?.abort(), []);

  /** 좋아요를 받은 내 기록 보기 */
  const openReview = async (notification) => {
    reviewRequest.current?.abort();
    const controller = new AbortController();
    reviewRequest.current = controller;
    setReviewError("");
    setIsReviewLoading(true);
    try {
      const review = await getReview(notification.reviewId, controller.signal);
      if (!controller.signal.aborted)
        setSelectedReview({
          restaurantName: review.restaurantName,
          image: reviewImageUrl(review.imageUrls?.[0]),
          review: review.content,
          tags: reviewTags(review),
        });
    } catch (error) {
      if (!controller.signal.aborted) setReviewError(getApiErrorMessage(error, "기록을 불러오지 못했어요."));
    } finally {
      if (!controller.signal.aborted) setIsReviewLoading(false);
    }
  };

  return (
    <>
      <PageTransition className="h-dvh w-full flex flex-col bg-[#FFFDF8] overflow-hidden">
        <div className="flex-1 overflow-y-auto scrollbar-hide px-[29px] pt-[88px] pb-32">
          <button type="button" onClick={() => navigate("/home")} aria-label="홈으로 돌아가기" className="mb-[22px]">
            <img src={LeftArrow} alt="" className="h-6 w-6" />
          </button>
          {/* 제목 및 조회 기간 */}
          <header className="mb-[25px] flex items-center justify-between">
            <h1 className="text-[22px] leading-[60px] font-bold text-[#F86516]">알림</h1>
            <div className="relative">
              <button
                type="button"
                aria-label="알림 조회 기간"
                aria-expanded={isDropdownOpen}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-1 text-[#F87816] active:opacity-60 transition-opacity cursor-pointer"
              >
                <span className="text-[12px] font-semibold leading-none">
                  {period === "week" ? "일주일 기준" : "30일 기준"}
                </span>
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
              {isDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-26 bg-[#FFFDF8] border-[1.5px] border-[#F86516] rounded-xl shadow-lg z-50 flex flex-col overflow-hidden">
                  {[
                    ["week", "일주일 기준"],
                    ["month", "30일 기준"],
                  ].map(([value, label], index) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => {
                        setPeriod(value);
                        setIsDropdownOpen(false);
                      }}
                      className={`py-2 text-[14px] font-bold transition-colors ${index > 0 ? "border-t border-[#F86516]/30" : ""} ${period === value ? "text-[#F86516] bg-[#FFECCD]" : "text-[#434343] active:bg-gray-50"}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </header>
          {/* 알림 목록 및 상태 안내 */}
          {isLoading && (
            <p role="status" className="exception-glow">
              알림을 불러오는 중이에요.
            </p>
          )}
          {error && (
            <div role="alert" className="exception-glow">
              <p>{error}</p>
              {needsLogin ? (
                <Link to="/login" className="mt-3 text-[#F86516] underline">
                  로그인하기
                </Link>
              ) : (
                <button type="button" onClick={retry} className="mt-3 text-[#F86516] underline">
                  다시 시도
                </button>
              )}
            </div>
          )}
          {!isLoading && !error && visible.length === 0 && (
            <p className="exception-glow">선택한 기간에 알림이 없어요.</p>
          )}
          <div className="flex flex-col gap-[16px]">
            {visible.map((item, index) => (
              <button
                key={`${item.reviewId}:${item.actorNickname}:${item.createdAt}:${index}`}
                type="button"
                onClick={() => openReview(item)}
                aria-label={`${item.restaurantName}: ${item.message}`}
                className="flex min-h-[51px] w-full items-center justify-between gap-4 text-left"
              >
                <span className="min-w-0 text-[14px] leading-5 font-medium text-[#FF9639]">
                  {item.actorNickname && item.message.startsWith(item.actorNickname) ? (
                    <><span className="text-[#F86516]">{item.actorNickname}</span>{item.message.slice(item.actorNickname.length)}</>
                  ) : item.message}
                </span>
                <img
                  src={reviewImageUrl(item.actorProfileImageUrl) || DefaultProfile}
                  alt={`${item.actorNickname} 프로필`}
                  loading="lazy"
                  decoding="async"
                  className="h-[51px] w-[52px] shrink-0 rounded-full object-cover"
                  onError={(event) => {
                    if (event.currentTarget.getAttribute("src") !== DefaultProfile)
                      event.currentTarget.src = DefaultProfile;
                  }}
                />
              </button>
            ))}
          </div>
          {isReviewLoading && (
            <p role="status" className="exception-glow mt-4">
              기록을 불러오는 중이에요.
            </p>
          )}
          {reviewError && (
            <p role="alert" className="exception-glow mt-4">
              {reviewError}
            </p>
          )}
        </div>
      </PageTransition>
      <BottomNav />
      {selectedReview && (
        <ReviewModal review={selectedReview} onClose={() => setSelectedReview(null)} showAuthor={false} />
      )}
    </>
  );
}
