import { useEffect, useRef } from "react";

/** 최근 Pick 삭제 확인 */
export default function DeletePickDialog({ onClose, onConfirm, isDeleting = false, error = "" }) {
  const dialogRef = useRef(null);
  const handledTouch = useRef(false);
  const touchStart = useRef(null);

  /** 버튼 위에서 시작한 짧은 터치만 허용 */
  function handlePointerDown(event) {
    handledTouch.current = false;
    touchStart.current = { x: event.clientX, y: event.clientY, id: event.pointerId };
  }

  /** 드래그 직후 브라우저가 클릭을 생략해도 첫 터치로 실행 */
  function handlePointerUp(event, action) {
    if (isDeleting || event.pointerType !== "touch") return;
    const start = touchStart.current;
    touchStart.current = null;
    if (!start || start.id !== event.pointerId || Math.hypot(event.clientX - start.x, event.clientY - start.y) > 10)
      return;
    handledTouch.current = true;
    action();
  }

  /** 터치에서 뒤따르는 클릭은 중복 실행하지 않음 */
  function handleClick(event, action) {
    if (handledTouch.current && event.detail !== 0) {
      handledTouch.current = false;
      return;
    }
    if (!isDeleting) action();
  }

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog.showModal();
    return () => dialog.close();
  }, []);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="delete-pick-title"
      onCancel={(event) => {
        event.preventDefault();
        if (!isDeleting) onClose();
      }}
      className={`fixed inset-0 m-auto ${error ? "min-h-[168px] pb-5" : "h-[168px]"} w-[290px] max-w-[calc(100%-48px)] rounded-[15px] border-2 border-[#FF8223] bg-[#FFFDF8] p-0 backdrop:bg-black/50`}
    >
      <h2 id="delete-pick-title" className="mt-[33px] text-center text-[16px] leading-[50px] font-bold text-[#F87816]">
        정말 삭제하시겠습니까?
      </h2>
      <div className="mt-[9px] flex justify-center gap-[11px]">
        <button
          type="button"
          disabled={isDeleting}
          onPointerDown={handlePointerDown}
          onPointerCancel={() => {
            touchStart.current = null;
          }}
          onPointerUp={(event) => handlePointerUp(event, onClose)}
          onClick={(event) => handleClick(event, onClose)}
          className="h-[33px] w-[74px] rounded-full bg-[#FFECCD] text-[11px] font-medium text-[#FF8223]"
        >
          아니요
        </button>
        <button
          type="button"
          disabled={isDeleting}
          onPointerDown={handlePointerDown}
          onPointerCancel={() => {
            touchStart.current = null;
          }}
          onPointerUp={(event) => handlePointerUp(event, onConfirm)}
          onClick={(event) => handleClick(event, onConfirm)}
          className="h-[33px] w-[74px] rounded-full bg-[#FF9639] text-[11px] font-medium text-[#FFF0DD]"
        >
          {isDeleting ? "삭제 중…" : "네"}
        </button>
      </div>
      {error && (
        <p role="alert" className="mt-4 px-5 text-center text-[12px] leading-5 text-[#777777]">
          {error}
        </p>
      )}
    </dialog>
  );
}
