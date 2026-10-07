import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import PageTransition from "../components/PageTransition";
import { buildRecommendationRequest, createRecommendation } from "../api/recommendations";
import { getNickname } from "../api/tokenStorage";
import searchingCharacter from "../assets/searching_character.png";

/** 진행률별 안내 */
function getStatusText(progress) {
  if (progress < 35) return "위치 분석 중...";
  if (progress < 70) return "취향 분석 중...";
  if (progress < 100) return "맛집 필터링 중...";
  return "선택 완료!";
}

export default function RecommendLoading() {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const [session, setSession] = useState(null);
  const requestRef = useRef(null);

  useEffect(() => {
    let active = true;
    // StrictMode에서도 추천 세션은 한 번만 생성
    if (!requestRef.current)
      requestRef.current = Promise.resolve().then(() =>
        createRecommendation(buildRecommendationRequest(location.state)),
      );
    requestRef.current
      .then((result) => {
        if (active) setSession(result);
      })
      .catch((error) => {
        if (active)
          setError(
            error.message === "INVALID_RECOMMENDATION_INPUT"
              ? "위치와 추천 조건을 다시 선택해주세요."
              : error.response?.status === 401
                ? "로그인이 필요해요."
                : "추천을 불러오지 못했어요. 다시 시도해주세요.",
          );
      });
    return () => {
      active = false;
    };
  }, [location.state]);

  // 서버 진행률이 없어 대기 중에는 90%까지 표시하고, 성공 후 완료
  useEffect(() => {
    if (error) return;
    const timer = setInterval(
      () => {
        setProgress((previous) => Math.min(session ? 100 : 90, previous + (session ? 10 : 7)));
      },
      session ? 150 : 450,
    );
    return () => clearInterval(timer);
  }, [session, error]);

  useEffect(() => {
    if (!session || progress !== 100 || error) return;
    const timer = setTimeout(() => {
      navigate(`/recommend/result?sessionId=${encodeURIComponent(session.sessionId)}`, {
        replace: true,
        state: location.state,
      });
    }, 600);
    return () => clearTimeout(timer);
  }, [session, progress, error, location.state, navigate]);

  return (
    <PageTransition className="h-dvh w-full flex flex-col items-center justify-between bg-[#FFFDF8] px-6 py-14 relative overflow-hidden">
      {/* 배경 그라데이션 */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[#ff9639] rounded-full blur-[30px] pointer-events-none"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.8, 0.3] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* 추천 진행 제목 */}
      <h1 className="text-[24px] font-bold text-[#F87816] leading-snug text-center relative z-10 mt-4">
        {getNickname() || "픽잇"}님을 위한
        <br />
        {location.state?.neighborhood || "선택한 지역"} 최적의 맛집 선택 중!
      </h1>
      {/* 검색 중 캐릭터 */}
      <img src={searchingCharacter} alt="맛집을 찾는 중" className="w-[50%] relative z-10" />
      {/* 진행률별 안내 & 프로그레스 바 */}
      <div className="w-full flex flex-col items-center relative z-10 text-center">
        <p role={error ? "alert" : "status"} className="font-bold text-[#FF9639]">
          {error || getStatusText(progress)}
        </p>
        {!error && (
          <>
            <span className="text-[14px] font-bold text-[#FF9639] tabular-nums mt-2 mb-4">{progress}%</span>
            <div
              role="progressbar"
              aria-label="맛집 추천 진행 상태"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progress}
              className="w-full max-w-[280px] h-3.5 bg-[#FFECCD] rounded-full overflow-hidden"
            >
              <div
                className="h-full bg-[#FF9639] rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </>
        )}
        {/* 오류 시 이동 버튼 */}
        {error && (
          <button className="mt-4 text-[#F86516] underline" onClick={() => navigate("/location")}>
            위치부터 다시 선택하기
          </button>
        )}
        {error === "로그인이 필요해요." && (
          <button className="block mx-auto mt-4 text-[#F86516] underline" onClick={() => navigate("/")}>
            로그인하기
          </button>
        )}
      </div>
    </PageTransition>
  );
}
