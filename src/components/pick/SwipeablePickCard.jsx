import { useEffect } from "react";
import { motion, useAnimationControls } from "framer-motion";
import PickSummaryCard from "./PickSummaryCard";
import BinIcon from "../../assets/icons/bin.svg";

const REVEAL_WIDTH = 88;

/** 최근 Pick 삭제 스와이프 */
export default function SwipeablePickCard({ pick, isOpen, onOpen, onClose }) {
  const controls = useAnimationControls();
  useEffect(() => {
    controls.start({ x: isOpen ? -REVEAL_WIDTH : 0 });
  }, [isOpen, controls]);
  return (
    <div
      role="group"
      aria-label={`${pick.restaurantName} 최근 pick`}
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          onOpen();
        } else if (event.key === "ArrowRight" || event.key === "Escape") {
          event.preventDefault();
          onClose();
        }
      }}
      className="relative overflow-hidden focus-visible:outline-2 focus-visible:outline-[#F86516]"
    >
      {/* 스와이프 삭제를 나타내는 장식 아이콘 */}
      <div
        aria-hidden="true"
        className="absolute inset-y-0 right-0 flex w-[72px] items-center justify-center pointer-events-none"
      >
        <img src={BinIcon} alt="" />
      </div>
      <motion.div
        drag="x"
        dragConstraints={{ left: -REVEAL_WIDTH, right: 0 }}
        dragElastic={0}
        dragMomentum={false}
        animate={controls}
        transition={{ type: "spring", stiffness: 400, damping: 36 }}
        onDragEnd={(_, info) => {
          const shouldOpen =
            info.offset.x < -30 || info.velocity.x < -300
              ? true
              : info.offset.x > 30 || info.velocity.x > 300
                ? false
                : isOpen;
          controls.start({ x: shouldOpen ? -REVEAL_WIDTH : 0 });
          if (shouldOpen) onOpen();
          else onClose();
        }}
        className="relative touch-pan-y select-none [&_img]:pointer-events-none"
      >
        <PickSummaryCard pick={pick} />
      </motion.div>
    </div>
  );
}
