import { useState } from "react";
import { Link } from "react-router-dom";
import PageTransition from "../components/common/PageTransition";
import BottomNav from "../components/layout/BottomNav";
import FeedReviewCard from "../components/review/FeedReviewCard";
import ReviewModal from "../components/review/ReviewModal";
import FeedGlow from "../assets/feed_glow.svg";
import useFeed from "../hooks/useFeed";

export default function Feed() {
  const [selectedReview, setSelectedReview] = useState(null);
  const {
    items,
    nextCursor,
    isLoading,
    isLoadingMore,
    error,
    needsLogin,
    retry,
    loadMore,
    toggleLike,
    pendingLikeIds,
    likeErrors,
  } = useFeed();

  return (
    <>
      <PageTransition className="h-dvh w-full flex flex-col relative bg-[#FFFDF8] overflow-hidden">
        <img src={FeedGlow} alt="" className="absolute -left-[307px] -top-[312px] max-w-none pointer-events-none" />
        <div className="relative min-h-0 flex-1 overflow-y-auto scrollbar-hide pb-32">
          <header className="pt-[60px] px-[33px] pb-[30px]">
            <div className="flex items-center gap-[13px] text-[16px] text-[#F87816]">
              <button type="button" aria-current="true" className="font-bold">
                최신
              </button>
              <span aria-hidden="true" className="h-[17px] w-px bg-[#F87816]" />
              <button type="button" onClick={() => alert("구현 예정입니다.")} className="font-semibold">
                좋아요순
              </button>
            </div>
          </header>

          <section aria-label="피드" className="flex flex-col gap-[33px]">
            {isLoading && (
              <p
                role="status"
                className="exception-glow min-h-[180px] flex items-center justify-center text-center text-sm text-[#777777]"
              >
                피드를 불러오는 중이에요.
              </p>
            )}
            {!isLoading && !error && items.length === 0 && (
              <p className="exception-glow min-h-[180px] flex items-center justify-center text-center text-sm text-[#777777]">
                아직 공개된 기록이 없어요.
              </p>
            )}
            {items.map((review) => (
              <FeedReviewCard
                key={review.id}
                review={review}
                liked={review.liked}
                onOpen={setSelectedReview}
                onToggleLike={() => toggleLike(review.id)}
                isLikePending={pendingLikeIds.includes(review.id)}
                likeError={likeErrors[review.id]}
              />
            ))}
            {error && (
              <div
                role="alert"
                className="exception-glow min-h-[180px] flex flex-col items-center justify-center text-center text-sm text-[#777777]"
              >
                <p>{error}</p>
                {needsLogin ? (
                  <Link to="/login" className="mt-3 inline-block text-[#F86516] underline">
                    로그인하기
                  </Link>
                ) : (
                  items.length === 0 && (
                    <button type="button" onClick={retry} className="mt-3 text-[#F86516] underline cursor-pointer">
                      다시 시도
                    </button>
                  )
                )}
              </div>
            )}
            {!isLoading && nextCursor !== null && !needsLogin && (
              <button
                type="button"
                onClick={loadMore}
                disabled={isLoadingMore}
                className="rounded-full bg-[#FFECCD] py-3 text-sm font-semibold text-[#F86516] cursor-pointer disabled:opacity-50"
              >
                {isLoadingMore ? "불러오는 중…" : error ? "다시 시도" : "더 보기"}
              </button>
            )}
          </section>
        </div>
      </PageTransition>
      <BottomNav />
      {selectedReview && (
        <ReviewModal
          key={selectedReview.id}
          review={selectedReview}
          showAuthor={false}
          expandedPhotos
          onClose={() => setSelectedReview(null)}
        />
      )}
    </>
  );
}
