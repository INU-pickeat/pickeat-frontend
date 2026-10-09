import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageTransition from "../components/PageTransition";
import LeftArrow from "../assets/arrow_left.svg";
import TabMenu from "../components/TabMenu";
import usePickCalendar from "../hooks/usePickCalendar";
import CheckIcon from "../assets/icons/check.svg";
import BottomNav from "../components/BottomNav";
import { formatCalendarDate, getCalendarCells } from "../utils/calendar";

export default function Calendar() {
  const navigate = useNavigate();

  // 한국 날짜 기준으로 초기 월을 표시
  const today = new Date(new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Seoul" }) + "T00:00:00");

  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(formatCalendarDate(today));

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;
  const { dates, isLoading, error, needsLogin, retry } = usePickCalendar(year, month);
  const records = Object.fromEntries(dates.map((record) => [record.date, record]));
  const selectedRecord = records[selectedDate];

  /** 월 이동 */
  const changeMonth = (offset) => {
    const nextDate = new Date(year, month - 1 + offset, 1);
    if (nextDate.getFullYear() < 2000 || nextDate.getFullYear() > 2100) return;
    setCurrentDate(nextDate);
    setSelectedDate(formatCalendarDate(nextDate));
  };
  const cells = getCalendarCells(currentDate);

  return (
    <>
      <PageTransition className="h-dvh w-full flex flex-col relative bg-[#FFFDF8] overflow-hidden">
        <div className="relative z-10 flex-1 overflow-y-auto scrollbar-hide pb-24">
          {/* 헤더 영역 */}
          <div className="pt-10 px-6 relative z-10">
            <button
              onClick={() => navigate("/home")}
              className="mb-6 p-2 -ml-2 active:scale-90 transition-transform cursor-pointer"
            >
              <img src={LeftArrow} alt="뒤로가기" className="w-6 h-6" />
            </button>

            {/* 탭 메뉴 */}
            <TabMenu />
          </div>
          {/* 캘린더 영역 */}
          <div className="px-6 relative z-10">
            <div className="bg-[#FFECCD] rounded-[20px] p-5 shadow-sm">
              <div className="flex items-center gap-1 mb-4">
                <button
                  onClick={() => changeMonth(-1)}
                  disabled={year === 2000 && month === 1}
                  aria-label="이전 달"
                  className="p-1 active:scale-75 transition-transform disabled:opacity-30"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#F86516"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>

                <h2 className="text-[#F86516] font-medium text-[16px]">
                  {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
                </h2>

                <button
                  onClick={() => changeMonth(1)}
                  disabled={year === 2100 && month === 12}
                  aria-label="다음 달"
                  className="p-1 active:scale-75 transition-transform disabled:opacity-30"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#F86516"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </div>

              {/* 요일 헤더 */}
              <div className="grid grid-cols-7 text-center mb-4">
                {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
                  <div key={day} className="font-medium text-[#000000] text-[14px]">
                    {day}
                  </div>
                ))}
              </div>

              {/* 날짜 그리드 */}
              <div className="grid grid-cols-7 gap-y-1 text-center">
                {cells.map((cell, idx) => {
                  const dayRecord = records[cell.dateStr];

                  const isSunday = idx % 7 === 0;

                  return (
                    <button
                      type="button"
                      disabled={!cell.isCurrent}
                      aria-pressed={selectedDate === cell.dateStr}
                      aria-label={`${cell.day}일${dayRecord ? `, 기록 ${dayRecord.recordCount}개` : ""}`}
                      key={cell.dateStr}
                      onClick={() => cell.isCurrent && setSelectedDate(cell.dateStr)}
                      className={`relative flex justify-center items-center h-10 w-full max-w-10 mx-auto rounded-full ${selectedDate === cell.dateStr ? "ring-2 ring-[#F86516]" : ""} ${cell.isCurrent ? "cursor-pointer" : "cursor-default opacity-40"}`}
                    >
                      {/* 기록이 있는 날짜 */}
                      {dayRecord?.representativeImageUrl && cell.isCurrent ? (
                        <div className="relative w-9 h-9 rounded-full overflow-hidden">
                          <img
                            src={dayRecord.representativeImageUrl}
                            alt={dayRecord.restaurantName}
                            onError={(event) => {
                              if (event.currentTarget.getAttribute("src") !== "/assets/dummy.png")
                                event.currentTarget.src = "/assets/dummy.png";
                            }}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        /* 일반 날짜 */
                        <span
                          className={`text-[14px] font-medium ${
                            !cell.isCurrent ? "text-[#C8C8C8]" : isSunday ? "text-[#F03232]" : "text-[#F87816]"
                          }`}
                        >
                          {cell.day}
                        </span>
                      )}
                      {dayRecord && cell.isCurrent && !dayRecord.representativeImageUrl && (
                        <span aria-hidden="true" className="absolute bottom-0 h-1 w-1 rounded-full bg-[#F86516]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 기록 상세 카드 영역 */}
          <div className="px-6 my-6 relative z-10">
            <h3 className="text-[#F87816] font-semibold text-[16px] ml-3 mb-4">
              {selectedDate.split("-")[0]}년 {selectedDate.split("-")[1].replace(/^0/, "")}월{" "}
              {selectedDate.split("-")[2].replace(/^0/, "")}일
            </h3>

            {isLoading ? (
              <p role="status" className="text-[#777777] text-sm">
                캘린더를 불러오는 중이에요.
              </p>
            ) : error ? (
              <div role="alert" className="text-sm">
                <p>{error}</p>
                {needsLogin ? (
                  <Link to="/login" className="mt-3 inline-block text-[#F86516] underline">
                    로그인하기
                  </Link>
                ) : (
                  <button type="button" onClick={retry} className="mt-3 text-[#F86516] underline cursor-pointer">
                    다시 시도
                  </button>
                )}
              </div>
            ) : selectedRecord ? (
              <div className="bg-[#FFECCD] rounded-[24px] px-5 py-4 flex justify-between items-center gap-4 shadow-sm">
                <div className="min-w-0">
                  <h4 className="text-[#F86516] font-bold text-[16px] mb-1">{selectedRecord.restaurantName}</h4>
                  <p className="text-[#434343] font-medium text-[12px]">
                    이 날 남긴 기록 {selectedRecord.recordCount}개
                  </p>
                </div>
                <div className="shrink-0 flex flex-col items-center gap-2">
                  <img src={CheckIcon} alt="" className="w-5 h-5" />
                  <span className="text-[#434343] text-[10px] font-medium">기록 완료</span>
                </div>
              </div>
            ) : (
              <div className="bg-[#FFFDF8] border-2 border-dashed border-[#FFECCD] rounded-[24px] p-6 flex justify-center items-center">
                <p className="text-center text-[#F87816] font-semibold text-[14px]">이 날은 작성한 후기가 없어요.</p>
              </div>
            )}
          </div>
        </div>
      </PageTransition>

      {/* 네비게이션 바 */}
      <BottomNav />
    </>
  );
}
