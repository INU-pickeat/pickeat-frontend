import { useEffect, useRef } from "react";

/** 식당 사진 전체 보기 */
export default function PhotoViewer({ images, current, name, onChange, onClose, onError }) {
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

  return (
    <dialog
      ref={dialogRef}
      aria-label={`${name} 사진 전체 보기`}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
          event.preventDefault();
          onChange((current + (event.key === "ArrowLeft" ? -1 : 1) + images.length) % images.length);
        }
      }}
      className="fixed inset-0 m-auto h-dvh max-h-none w-full max-w-[430px] border-0 bg-black p-0 text-white backdrop:bg-black/80"
    >
      <div className="relative flex h-full w-full items-center justify-center">
        <img
          src={images[current]}
          alt={`${name} 사진 ${current + 1}`}
          onError={() => onError(images[current])}
          className="max-h-full w-full object-contain"
        />
        <button
          type="button"
          aria-label="사진 전체 보기 닫기"
          onClick={onClose}
          className="absolute right-4 top-6 h-10 w-10 text-[28px]"
        >
          ×
        </button>
        {images.length > 1 && (
          <>
            <button
              type="button"
              aria-label="전체 보기 이전 사진"
              onClick={() => onChange((current + images.length - 1) % images.length)}
              className="absolute left-3 top-1/2 h-10 w-10 -translate-y-1/2 rounded-full bg-black/50 text-2xl"
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="전체 보기 다음 사진"
              onClick={() => onChange((current + 1) % images.length)}
              className="absolute right-3 top-1/2 h-10 w-10 -translate-y-1/2 rounded-full bg-black/50 text-2xl"
            >
              ›
            </button>
          </>
        )}
        <p className="absolute bottom-8 left-0 w-full text-center text-sm">
          {current + 1} / {images.length}
        </p>
      </div>
    </dialog>
  );
}
