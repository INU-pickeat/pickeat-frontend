import { useRef } from "react";

/** 세로 스크롤을 유지하는 사진 스와이프 */
export default function usePhotoSwipe(onSwipe, onTap) {
  const gesture = useRef(null);
  const suppressClick = useRef(false);

  /** 한 손가락 제스처 시작 */
  function onTouchStart(event) {
    suppressClick.current = false;
    const touch = event.touches[0];
    gesture.current =
      event.touches.length === 1 ? { id: touch.identifier, x: touch.clientX, y: touch.clientY, vertical: false } : null;
  }

  /** 세로 이동과 다중 터치는 사진 넘기기에서 제외 */
  function onTouchMove(event) {
    const start = gesture.current;
    if (!start) return;
    if (event.touches.length !== 1) {
      gesture.current = null;
      return;
    }
    const touch = event.touches[0];
    const dx = Math.abs(touch.clientX - start.x);
    const dy = Math.abs(touch.clientY - start.y);
    if (dx > 8 || dy > 8) suppressClick.current = true;
    if (dy > 12 && dy > dx) start.vertical = true;
  }

  /** 충분한 가로 이동일 때 한 장씩 넘기기 */
  function onTouchEnd(event) {
    const start = gesture.current;
    gesture.current = null;
    if (!start || start.vertical) return;
    const touch = [...event.changedTouches].find((item) => item.identifier === start.id);
    if (!touch) return;
    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    if (onTap && Math.abs(dx) <= 8 && Math.abs(dy) <= 8) {
      suppressClick.current = true;
      onTap();
      return;
    }
    if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    suppressClick.current = true;
    onSwipe(dx < 0 ? 1 : -1);
  }

  /** 스와이프 직후 합성 클릭 차단 */
  function onClickCapture(event) {
    if (!suppressClick.current || event.detail === 0) return;
    suppressClick.current = false;
    event.preventDefault();
    event.stopPropagation();
  }

  /** 브라우저가 취소한 제스처 정리 */
  function onTouchCancel() {
    gesture.current = null;
    suppressClick.current = true;
  }

  return { onTouchStart, onTouchMove, onTouchEnd, onTouchCancel, onClickCapture };
}
