import { useEffect, useRef } from "react";

export default function ReviewModal({ review, onClose, showAuthor = true }) {
  const dialogRef = useRef(null);

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
      aria-describedby="review-modal-content"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={handleBackdropClick}
      className="fixed inset-0 m-auto w-[calc(100%-32px)] max-w-[398px] max-h-[85dvh] overflow-hidden rounded-[24px] border-0 p-0 bg-[#FFECCD] backdrop:bg-black/50"
    >
      {/* 식당 이미지 & 개요 영역 */}
      <div className="flex max-h-[85dvh] flex-col">
        <div className="relative h-[210px] max-h-[40dvh] shrink-0">
          <img src={review.image} alt={review.restaurantName} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />
          {showAuthor && (
            <div className="absolute left-6 top-6 right-14 flex items-center gap-3">
              <div className="h-11 w-11 shrink-0 rounded-full overflow-hidden bg-[#FF7D16]">
                {review.avatar && <img src={review.avatar} alt="" className="h-full w-full object-cover" />}
              </div>
              <span className="truncate text-[14px] font-semibold text-white">{review.author}</span>
            </div>
          )}

          {/* 기록 영역 */}
          <div className="absolute bottom-5 left-6 right-6 flex items-center justify-between gap-3 text-white">
            <h2 id="review-modal-title" className="min-w-0 text-[16px] font-bold font-[#FFFDF8]">
              {review.restaurantName}
            </h2>
            <span className="shrink-0 text-[12px] font-medium font-[#fffdf8]">{review.tags}</span>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-7 scrollbar-hide">
          <p
            id="review-modal-content"
            className="min-h-[110px] whitespace-pre-wrap break-keep text-[14px] font-medium leading-relaxed text-[#686767]"
          >
            {review.review}
          </p>
        </div>
      </div>
    </dialog>
  );
}
