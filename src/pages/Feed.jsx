import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageTransition from "../components/PageTransition";
import TabMenu from "../components/TabMenu";
import BottomNav from "../components/BottomNav";
import FeedReviewCard from "../components/FeedReviewCard";
import ReviewModal from "../components/ReviewModal";
import LeftArrow from "../assets/arrow_left.svg";
import useFeed from "../hooks/useFeed";

export default function Feed() {
  const navigate = useNavigate();
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
        <div className="min-h-0 flex-1 overflow-y-auto scrollbar-hide pb-28">
          <header className="pt-10 px-6">
            <button
              type="button"
              onClick={() => navigate("/home")}
              aria-label="홈으로 돌아가기"
              className="mb-6 p-2 -ml-2 active:scale-90 transition-transform cursor-pointer"
            >
              <img src={LeftArrow} alt="뒤로가기" className="w-6 h-6" />
            </button>
            <TabMenu />
          </header>

          <section aria-label="피드" className="px-6 flex flex-col gap-4">
            {isLoading && (
              <p role="status" className="text-center text-sm text-[#777777]">
                피드를 불러오는 중이에요.
              </p>
            )}
            {!isLoading && !error && items.length === 0 && (
              <p className="text-center text-sm text-[#777777]">아직 공개된 후기가 없어요.</p>
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
              <div role="alert" className="text-center text-sm text-[#777777]">
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
      {selectedReview && <ReviewModal review={selectedReview} onClose={() => setSelectedReview(null)} />}
    </>
  );
}
