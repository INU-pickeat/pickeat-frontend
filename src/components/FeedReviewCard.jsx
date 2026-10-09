export default function FeedReviewCard({ review, liked, onToggleLike, onOpen, isLikePending = false, likeError }) {
  return (
    <article className="relative overflow-hidden rounded-[22px] bg-[#FFECCD]">
      {onOpen && (
        <button
          type="button"
          onClick={() => onOpen(review)}
          aria-label={`${review.author}님의 ${review.restaurantName} 리뷰 보기`}
          className="absolute inset-0 z-10 cursor-pointer rounded-[22px] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#F87816]"
        />
      )}
      <div className="relative h-[160px] bg-[#FAB47A]">
        {/* 식당 이미지 영역 */}
        {review.image && (
          <img src={review.image} alt={review.restaurantName} loading="lazy" className="h-full w-full object-cover" />
        )}
        <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/20 to-transparent pointer-events-none" />

        {/* 좋아요 버튼 */}
        <button
          type="button"
          onClick={onToggleLike}
          disabled={!onToggleLike || isLikePending}
          aria-label={
            onToggleLike
              ? liked
                ? "좋아요 취소"
                : "좋아요"
              : `좋아요 ${review.likeCount ?? 0}개${liked ? ", 내가 좋아한 후기" : ""}`
          }
          aria-pressed={liked}
          aria-busy={isLikePending}
          className="absolute right-5 top-5 z-20 flex h-5 w-5 items-center justify-center text-white cursor-pointer disabled:cursor-default active:scale-90 transition-transform"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-6 w-6 drop-shadow"
            fill={liked ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"
            />
          </svg>
        </button>
      </div>

      {/* 카드 영역 */}
      <div className="px-5 pt-4 pb-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-[#FF7D16]">
              {review.avatar && <img src={review.avatar} className="h-full w-full object-cover" />}
            </div>
            <span className="truncate text-[14px] font-semibold text-[#F87816]">{review.author}</span>
          </div>
          <div className="min-w-0 flex-1 text-right">
            <h2 className="truncate text-[14px] font-bold text-[#F87816]">{review.restaurantName}</h2>
            <p className="mt-1 text-[10px] font-medium text-[#686767]">{review.tags}</p>
          </div>
        </div>
        <p className="mt-4 truncate text-[12px] font-medium text-[#686767]">{review.review}</p>
        {likeError && (
          <p role="alert" className="relative z-20 mt-3 text-xs text-[#FF5C5C]">
            {likeError}
          </p>
        )}
      </div>
    </article>
  );
}
