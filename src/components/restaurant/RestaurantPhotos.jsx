import { useState } from "react";
import PhotoViewer from "./PhotoViewer";
import usePhotoSwipe from "../../hooks/usePhotoSwipe";
import RestaurantImage from "./RestaurantImage";

/** 식당 사진 넘기기 */
export default function RestaurantPhotos({ images, name }) {
  const [failed, setFailed] = useState([]);
  const [index, setIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const visible = images.filter((url) => !failed.includes(url));
  const current = visible.length ? index % visible.length : 0;
  const swipe = usePhotoSwipe(
    (direction) => {
      if (visible.length > 1) setIndex((current + direction + visible.length) % visible.length);
    },
    () => setIsOpen(true),
  );

  /** 로드에 실패한 사진 제외 */
  const hideFailed = (url) => setFailed((previous) => (previous.includes(url) ? previous : [...previous, url]));

  return (
    <div className="absolute inset-0" role="region" aria-label="식당 사진">
      {/* 로딩에 실패한 사진은 제외 */}
      {visible.length === 0 && <RestaurantImage alt={`${name} 기본 사진`} className="h-full w-full object-cover" />}
      {visible.map((url, position) => (
        <img
          key={url}
          src={url}
          alt={`${name} 사진 ${position + 1}`}
          aria-hidden={position !== current}
          onError={() => hideFailed(url)}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ease-in-out motion-reduce:transition-none ${position === current ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        />
      ))}

      {visible.length > 0 && (
        <button
          type="button"
          aria-label="식당 사진 전체 보기"
          {...swipe}
          style={{ touchAction: "pan-y pinch-zoom" }}
          onClick={() => setIsOpen(true)}
          className="absolute inset-0"
        />
      )}

      {/* 이전·다음 사진 버튼 */}
      {visible.length > 1 && (
        <>
          <button
            type="button"
            aria-label="이전 사진"
            onClick={() => setIndex((current + visible.length - 1) % visible.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-[#FFFDF8]/85 text-[#F86516] shadow-sm"
          >
            <Chevron />
          </button>
          <button
            type="button"
            aria-label="다음 사진"
            onClick={() => setIndex((current + 1) % visible.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-[#FFFDF8]/85 text-[#F86516] shadow-sm"
          >
            <Chevron next />
          </button>
        </>
      )}
      {isOpen && visible.length > 0 && (
        <PhotoViewer
          images={visible}
          current={current}
          name={name}
          onChange={setIndex}
          onClose={() => setIsOpen(false)}
          onError={hideFailed}
        />
      )}
    </div>
  );
}

function Chevron({ next = false }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className={`h-4 w-4 ${next ? "rotate-180" : ""}`}>
      <path d="m14 5-7 7 7 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
