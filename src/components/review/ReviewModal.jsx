import { useEffect, useRef, useState } from "react";
import DefaultProfile from "../../assets/profile_default.png";
import usePhotoSwipe from "../../hooks/usePhotoSwipe";
import { reviewImageUrl } from "../../utils/reviewDisplay";

export default function ReviewModal({ review, onClose, showAuthor = true, expandedPhotos = false }) {
  const dialogRef = useRef(null);
  const [index, setIndex] = useState(0);
  const images = expandedPhotos
    ? (review.images || review.imageUrls || (review.image ? [review.image] : []))
        .filter(Boolean)
        .slice(0, 5)
        .map(reviewImageUrl)
    : review.image
      ? [review.image]
      : [];
  const current = images.length ? index % images.length : 0;
  /** 사진을 순환해서 넘기기 */
  function changePhoto(direction) {
    if (images.length > 1) setIndex((current + direction + images.length) % images.length);
  }
  const swipe = usePhotoSwipe(changePhoto);

  useEffect(() => {
    const dialog = dialogRef.current;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const handleBackdropClick = (event) => {
    if (event.target !== dialogRef.current) return;
    const bounds = dialogRef.current.getBoundingClientRect();
    if (
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom
    ) {
      onClose();
    }
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="review-modal-title"
      aria-describedby={review.review ? "review-modal-content" : undefined}
      onKeyDown={(event) => {
        if (expandedPhotos && (event.key === "ArrowLeft" || event.key === "ArrowRight")) {
          event.preventDefault();
          changePhoto(event.key === "ArrowLeft" ? -1 : 1);
        }
      }}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={handleBackdropClick}
      className="review-modal fixed inset-0 m-auto w-[calc(100%-32px)] max-w-[398px] max-h-[85dvh] overflow-hidden rounded-[24px] border-0 p-0 bg-[#FFECCD] backdrop:bg-black/50"
    >
      {/* 식당 이미지 & 개요 영역 */}
      <div className="review-modal-body flex max-h-[85dvh] flex-col">
        <div
          className={`review-modal-photo ${expandedPhotos ? "expanded" : ""} relative ${images.length ? (expandedPhotos ? "h-[320px] max-h-[55dvh]" : "h-[210px] max-h-[40dvh]") : "h-[120px] bg-[#FF9639]"} shrink-0`}
        >
          {images.length > 0 && (
            <img
              {...swipe}
              draggable={false}
              style={{ touchAction: "pan-y pinch-zoom" }}
              src={images[current]}
              alt={`${review.restaurantName} 사진 ${current + 1}`}
              className="h-full w-full object-cover"
            />
          )}
          {/* 여러 장 기록 사진 이동 */}
          {!expandedPhotos && images.length > 1 && (
            <>
              <button
                type="button"
                aria-label="이전 기록 사진"
                onClick={() => changePhoto(-1)}
                className="absolute left-3 top-1/2 z-10 h-9 w-9 -translate-y-1/2 rounded-full bg-black/40 text-white"
              >
                ‹
              </button>
              <button
                type="button"
                aria-label="다음 기록 사진"
                onClick={() => changePhoto(1)}
                className="absolute right-3 top-1/2 z-10 h-9 w-9 -translate-y-1/2 rounded-full bg-black/40 text-white"
              >
                ›
              </button>
              <span className="absolute top-4 left-4 z-10 rounded-full bg-black/40 px-2 py-1 text-xs text-white">
                {current + 1} / {images.length}
              </span>
            </>
          )}
          {/* 피드 상세 사진 위치 표시 */}
          {expandedPhotos && images.length > 0 && (
            <div
              role="img"
              aria-label={`사진 ${current + 1} / ${images.length}`}
              className="absolute bottom-[20px] left-0 right-0 z-10 flex justify-center gap-2 pointer-events-none"
            >
              {images.map((_, position) => (
                <span
                  key={position}
                  aria-hidden="true"
                  aria-current={position === current ? "true" : undefined}
                  className={`h-2 w-2 rounded-full ${position === current ? "bg-[#F87816]" : "bg-[#D9D9D9]"}`}
                />
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="absolute right-3 top-3 z-10 h-8 w-8 text-white text-xl cursor-pointer"
          >
            ×
          </button>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />
          {showAuthor && (
            <div className="absolute left-6 top-6 right-14 flex items-center gap-3">
              <div className="h-11 w-11 shrink-0 rounded-full overflow-hidden bg-[#FF7D16]">
                <img
                  src={review.avatar || DefaultProfile}
                  alt=""
                  className="h-full w-full object-cover"
                  onError={(event) => {
                    if (event.currentTarget.getAttribute("src") !== DefaultProfile)
                      event.currentTarget.src = DefaultProfile;
                  }}
                />
              </div>
              <span className="truncate text-[14px] font-semibold text-white">{review.author}</span>
            </div>
          )}

          {/* 기록 영역 */}
          <div
            className={`absolute ${expandedPhotos ? "bottom-[40px]" : "bottom-5"} left-6 right-6 flex items-center justify-between gap-3 text-white`}
          >
            <h2 id="review-modal-title" className="min-w-0 text-[16px] font-bold">
              {review.restaurantName}
            </h2>
            <span className="shrink-0 text-[12px] font-medium">{review.tags}</span>
          </div>
        </div>
        {review.review && (
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-7 scrollbar-hide">
            <p
              id="review-modal-content"
              className="min-h-[110px] whitespace-pre-wrap break-keep text-[14px] font-medium leading-relaxed text-[#686767]"
            >
              {review.review}
            </p>
          </div>
        )}
      </div>
    </dialog>
  );
}
