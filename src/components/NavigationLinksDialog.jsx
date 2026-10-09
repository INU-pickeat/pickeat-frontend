import { useEffect, useRef, useState } from "react";
import { getNavigationLinks } from "../api/restaurants";
import { getApiErrorMessage } from "../utils/apiError";

/** 길안내 지도 선택 */
export default function NavigationLinksDialog({ restaurantId, onClose }) {
  const dialogRef = useRef(null);
  const [links, setLinks] = useState(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog.showModal();
    return () => dialog.close();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    getNavigationLinks(restaurantId, controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setLinks(data);
      })
      .catch((error) => {
        if (!controller.signal.aborted) setError(getApiErrorMessage(error, "길안내 링크를 불러오지 못했어요."));
      });
    return () => controller.abort();
  }, [restaurantId, attempt]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="navigation-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      className="fixed inset-0 m-auto w-[calc(100%-48px)] max-w-sm rounded-[24px] bg-[#FFFDF8] p-6 backdrop:bg-black/50"
    >
      {/* 지도 선택 제목 */}
      <h2 id="navigation-title" className="text-center text-lg font-bold text-[#F86516]">
        길안내
      </h2>

      {/* 로딩·오류·링크 없음 안내 */}
      {(!links || (!links.naverMapUrl && !links.kakaoMapUrl)) && (
        <div className="min-h-[180px] flex flex-col items-center justify-center text-center text-sm text-[#777777]">
          <p role={error ? "alert" : "status"}>
            {error || (links ? "이 식당의 지도 링크가 없어요." : "지도 링크를 불러오는 중이에요.")}
          </p>
          {error && (
            <button
              onClick={() => {
                setError("");
                setAttempt((value) => value + 1);
              }}
              className="mt-3 text-[#F86516] underline"
            >
              다시 시도
            </button>
          )}
        </div>
      )}

      {/* 외부 지도 링크 */}
      {links && (
        <div className="mt-5 flex flex-col gap-3">
          {[
            ["네이버지도", links.naverMapUrl],
            ["카카오맵", links.kakaoMapUrl],
          ]
            .filter(([, url]) => url)
            .map(([label, url]) => (
              <a
                key={label}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-[#FFECCD] py-3 text-center font-semibold text-[#F86516]"
              >
                {label}
              </a>
            ))}
        </div>
      )}
      <button onClick={onClose} className="mt-5 block w-full text-center text-sm text-[#777777]">
        닫기
      </button>
    </dialog>
  );
}
