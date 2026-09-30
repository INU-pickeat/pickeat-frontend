import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import PageTransition from "../components/PageTransition";

export default function RecommendLoading() {
  const navigate = useNavigate();
  const location = useLocation();

  const [progress, setProgress] = useState(0); // 진행률 상태

  // 유저/동네 더미데이터
  const userName = "픽잇";
  const neighborhood = location.state?.neighborhood || "혜화동";

  // 진행률에 따른 텍스트 반환 함수
  const getStatusText = (prog) => {
    if (prog < 35) return "위치 분석 중...";
    if (prog < 70) return "취향 분석 중...";
    if (prog < 100) return "맛집 필터링 중...";
    return "선택 완료!";
  };

  useEffect(() => {
    let timeoutId;

    const updateProgress = () => {
      setProgress((prev) => {
        // 무작위 퍼센트 증가
        const increment = Math.floor(Math.random() * 10) + 3;
        const nextProgress = prev + increment;

        if (nextProgress >= 100) return 100;

        // 무작위 딜레이
        const randomDelay = Math.floor(Math.random() * 800) + 1000;
        timeoutId = setTimeout(updateProgress, randomDelay);

        return nextProgress;
      });
    };

    timeoutId = setTimeout(updateProgress, 500); // 첫 시작 딜레이

    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    if (progress === 100) {
      const finishTimer = setTimeout(() => {
        navigate("/recommend/result", { state: location.state });
      }, 800);
      return () => clearTimeout(finishTimer);
    }
  }, [progress, navigate, location.state]);

  return (
    <PageTransition className="h-dvh w-full flex flex-col items-center justify-between bg-[#FFFDF8] px-6 py-14 relative overflow-hidden">
      {/* 배경 중앙 그라데이션 */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[#ff9639] rounded-full blur-[30px] pointer-events-none"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.8, 0.3],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* 상단 텍스트 영역 */}
      <div className="flex flex-col items-center relative z-10 text-center mt-4">
        <h1 className="text-[24px] font-bold text-[#F87816] leading-snug">
          {userName}님을 위한
          <br />
          {neighborhood} 최적의 맛집 선택 중!
        </h1>
      </div>

      {/* 프로그레스 바 영역 */}
      <div className="w-full flex flex-col items-center relative z-10">
        {/* 상태 텍스트 & 퍼센트 */}
        <div className="flex flex-col items-center mb-4">
          <span className="text-[16px] font-bold text-[#FF9639] mb-2">{getStatusText(progress)}</span>
          <span className="text-[14px] font-bold text-[#FF9639] tabular-nums mb-2">{progress}%</span>
        </div>

        {/* 프로그레스 바 뼈대 */}
        <div className="w-full max-w-[280px] h-3.5 bg-[#FFECCD] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#FF9639] rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </PageTransition>
  );
}
