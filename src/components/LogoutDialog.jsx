import { useEffect, useRef } from "react";

/** 로그아웃 확인 */
export default function LogoutDialog({ onClose, onConfirm, isLoggingOut }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog.showModal();
    return () => dialog.close();
  }, []);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="logout-title"
      onCancel={(event) => {
        event.preventDefault();
        if (!isLoggingOut) onClose();
      }}
      className="fixed inset-0 m-auto h-[168px] w-[290px] max-w-[calc(100%-48px)] rounded-[15px] border-2 border-[#FF8223] bg-[#FFFDF8] p-0 backdrop:bg-black/50"
    >
      <h2 id="logout-title" className="mt-[33px] text-center text-[16px] leading-[50px] font-bold text-[#F87816]">
        로그아웃 하시겠습니까?
      </h2>
      <div className="mt-[9px] flex justify-center gap-[11px]">
        <button
          type="button"
          disabled={isLoggingOut}
          onClick={onClose}
          className="h-[33px] w-[74px] rounded-full bg-[#FFECCD] text-[11px] font-medium text-[#FF8223]"
        >
          아니요
        </button>
        <button
          type="button"
          disabled={isLoggingOut}
          onClick={onConfirm}
          className="h-[33px] w-[74px] rounded-full bg-[#FF9639] text-[11px] font-medium text-[#FFF0DD]"
        >
          {isLoggingOut ? "로그아웃 중…" : "네"}
        </button>
      </div>
    </dialog>
  );
}
