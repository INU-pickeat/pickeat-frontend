import DefaultProfile from "../../assets/profile_default.png";
import HeartFilled from "../../assets/icons/heart_filled.svg";
import HeartOutline from "../../assets/icons/heart_outline.svg";

export default function FeedReviewCard({ review, liked, onToggleLike, onOpen, isLikePending = false, likeError }) {
  return (
    <article className="relative">
      {onOpen && (
        <button
          type="button"
          onClick={() => onOpen(review)}
          aria-label={`${review.author}님의 ${review.restaurantName} 기록 보기`}
          className="absolute inset-0 z-10 focus-visible:outline-2 focus-visible:outline-[#F87816]"
        />
      )}
      {/* 작성자와 팔로우 */}
      <header className="mb-4 flex h-[50px] items-center justify-between gap-3 px-[25px]">
        <div className="flex min-w-0 items-center gap-2">
          <img
            src={review.avatar || DefaultProfile}
            alt="프로필 이미지"
            className="h-[38px] w-[38px] shrink-0 rounded-full object-cover"
            onError={(event) => {
              if (event.currentTarget.getAttribute("src") !== DefaultProfile) event.currentTarget.src = DefaultProfile;
            }}
          />
          <span className="truncate text-[16px] font-bold text-[#F86516]">{review.author}</span>
        </div>
        <button
          type="button"
          onClick={() => alert("구현 예정입니다.")}
          className="relative z-20 shrink-0 text-[14px] font-semibold text-[#F86516]"
        >
          팔로우
        </button>
      </header>

      {/* 기록 사진 */}
      {(review.thumbnail || review.image) && (
        <img
          src={review.thumbnail || review.image}
          alt={review.restaurantName}
          loading="lazy"
          className="h-[194px] w-full object-cover"
        />
      )}

      {/* 식당 정보와 좋아요 */}
      <div className="mt-[15px] px-6">
        <div className="flex min-h-[50px] items-center justify-between gap-3">
          <div className="flex min-w-0 flex-wrap items-center gap-x-[13px] gap-y-1">
            <h2 className="min-w-0 break-words text-[16px] font-bold text-[#F87816]">{review.restaurantName}</h2>
            <p className="text-[11px] font-medium text-[#434343]">{review.tags}</p>
          </div>
          <div className="relative z-20 flex shrink-0 flex-col items-center gap-1">
            <button
              type="button"
              onClick={onToggleLike}
              disabled={!onToggleLike || isLikePending}
              aria-label={liked ? "좋아요 취소" : "좋아요"}
              aria-pressed={liked}
              aria-busy={isLikePending}
              className="flex h-7 w-7 items-center justify-center active:scale-90 transition-transform"
            >
              <img src={liked ? HeartFilled : HeartOutline} alt="" />
            </button>
            <span className="text-[10px] leading-none text-[#F87816]">{review.likeCount ?? 0}</span>
          </div>
        </div>
        <p className="truncate text-[12px] font-medium leading-6 text-[#686767]">{review.review}</p>
        {likeError && (
          <p role="alert" className="relative z-20 mt-3 text-xs text-[#FF5C5C]">
            {likeError}
          </p>
        )}
      </div>
    </article>
  );
}
