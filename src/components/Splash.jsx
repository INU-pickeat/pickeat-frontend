import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import logoImg from "../assets/pickeat_logo.svg";

export default function Splash({ onFinish }) {
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // 일정 시간 뒤 로그인 화면으로 전환
    const finishTimer = setTimeout(() => onFinish(), 3500);
    return () => clearTimeout(finishTimer);
  }, [onFinish]);

  return (
    <div
      className={`w-full flex-1 flex justify-center items-center relative overflow-hidden bg-pickeat-white transition-opacity duration-300 ${
        isFadingOut ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* 원형 레이어 */}
      <motion.div
        style={{
          position: "absolute",
          top: "-50%",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          transform: "translate(-50%, 0)",
          filter: "blur(100px)", // 블러 효과

          // 내부 그라데이션
          background: "radial-gradient(circle at center, #f87816 0%, #fab47a 60%, #fcf1df 100%)",
          opacity: 0.9,
          zIndex: 1,
        }}
        // 애니메이션
        initial={{ scale: 0, opacity: 0.1 }}
        animate={{
          scale: 3,
          opacity: [0.1, 0.9, 0.8],
        }}
        transition={{
          duration: 3,
          ease: "easeInOut",
          times: [0, 0.3, 1], // 각 상태 도달 타이밍
        }}
      />

      <motion.img
        src={logoImg}
        alt="pickeat 로고"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut", delay: 1 }}
        className="w-40 z-10"
      />
    </div>
  );
}
