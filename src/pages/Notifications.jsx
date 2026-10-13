import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageTransition from "../components/PageTransition";
import BottomNav from "../components/BottomNav";
import LeftArrow from "../assets/arrow_left.svg";

/** 알림 화면 */
export default function Notifications() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState("week");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <>
      <PageTransition className="h-dvh w-full flex flex-col bg-[#FFFDF8] overflow-hidden">
        <div className="flex-1 overflow-y-auto scrollbar-hide px-[29px] pt-[88px] pb-32">
          <button type="button" onClick={() => navigate("/home")} aria-label="홈으로 돌아가기" className="mb-[22px]">
            <img src={LeftArrow} alt="" className="h-6 w-6" />
          </button>
          {/* 제목 및 조회 기간 */}
          <header className="mb-[25px] flex items-center justify-between">
            <h1 className="text-[22px] leading-[60px] font-bold text-[#F86516]">알림</h1>
            <div className="relative">
              <button type="button" aria-label="알림 조회 기간" aria-expanded={isDropdownOpen} onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center space-x-1 text-[#F87816] active:opacity-60 transition-opacity cursor-pointer">
                <span className="text-[12px] font-semibold leading-none">{period === "week" ? "일주일 기준" : "30일 기준"}</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-26 bg-[#FFFDF8] border-[1.5px] border-[#F86516] rounded-xl shadow-lg z-50 flex flex-col overflow-hidden">
                  {[ ["week", "일주일 기준"], ["month", "30일 기준"] ].map(([value, label], index) => (
                    <button key={value} type="button" onClick={() => {
                      setPeriod(value);
                      setIsDropdownOpen(false);
                    }} className={`py-2 text-[14px] font-bold transition-colors ${index > 0 ? "border-t border-[#F86516]/30" : ""} ${period === value ? "text-[#F86516] bg-[#FFECCD]" : "text-[#434343] active:bg-gray-50"}`}>{label}</button>
                  ))}
                </div>
              )}
            </div>
          </header>
          {/* 알림 API 연결 대기 */}
          <p role="status" className="exception-glow">
            알림 기능을 준비 중이에요.
          </p>
        </div>
      </PageTransition>
      <BottomNav />
    </>
  );
}
