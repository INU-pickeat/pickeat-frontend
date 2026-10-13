import { useEffect, useRef } from "react";

/** 최근 Pick 삭제 확인 */
export default function DeletePickDialog({ onClose, onConfirm, isDeleting = false, error = "" }) {
  const dialogRef = useRef(null);

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
          onClick={onClose}
          className="h-[33px] w-[74px] rounded-full bg-[#FFECCD] text-[11px] font-medium text-[#FF8223]"
        >
          아니요
        </button>
        <button
          type="button"
          disabled={isDeleting}
          onClick={onConfirm}
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
