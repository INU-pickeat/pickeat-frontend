import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageTransition from "../components/PageTransition";
import TabMenu from "../components/TabMenu";
import BottomNav from "../components/BottomNav";
import FeedReviewCard from "../components/FeedReviewCard";
import LeftArrow from "../assets/arrow_left.svg";
import { feedReviews } from "../data/feedReviews";

export default function Feed() {
  const navigate = useNavigate();
  const [likedIds, setLikedIds] = useState(() =>
    feedReviews.filter((review) => review.liked).map((review) => review.id),
  );

  const toggleLike = (id) => {
    setLikedIds((previous) =>
      previous.includes(id) ? previous.filter((likedId) => likedId !== id) : [...previous, id],
    );
  };

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
            {feedReviews.map((review) => (
              <FeedReviewCard
                key={review.id}
                review={review}
                liked={likedIds.includes(review.id)}
                onToggleLike={() => toggleLike(review.id)}
              />
            ))}
          </section>
        </div>
      </PageTransition>
      <BottomNav />
    </>
  );
}
