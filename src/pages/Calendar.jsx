import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageTransition from "../components/PageTransition";
import LeftArrow from "../assets/arrow_left.svg";
import TabMenu from "../components/TabMenu";
import WriteIcon from "../assets/icons/write.svg";
import CheckIcon from "../assets/icons/check.svg";
import BottomNav from "../components/BottomNav";

export default function Calendar() {
  const navigate = useNavigate();

  // 금일 기준으로 캘린더 표시
  const today = new Date();
  const getFormattedDate = (date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  };

  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(getFormattedDate(today)); // 사용자가 클릭한 날짜 상태

  // 기록 더미데이터
  const [records, setRecords] = useState({
    "2026-10-01": [
      {
        id: 1,
        restaurantName: "더미1",
        category: "한식",
        visitDate: "10월 1일",
        image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=200&auto=format&fit=crop",
        isRecorded: false,
      },
    ],
    "2026-10-02": [
      {
        id: 2,
        restaurantName: "더미2",
        category: "일식",
        visitDate: "10월 2일",
        image: "https://images.unsplash.com/photo-1525648199074-cee30ba79a4a?q=80&w=200&auto=format&fit=crop",
        isRecorded: true,
      },
      {
        id: 3,
        restaurantName: "더미3",
        category: "중식",
        visitDate: "10월 2일",
        image: "https://images.unsplash.com/photo-1544681280-d2dc1a61c314?q=80&w=200&auto=format&fit=crop",
        isRecorded: false,
      },
    ],
  });

  // 월 이동 함수
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  // 날짜 계산 로직
  const getCalendarCells = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate(); // 이번 달 총 일수
    const daysInPrevMonth = new Date(year, month, 0).getDate(); // 저번 달 총 일수

    const cells = [];

    // 이전 달 날짜
    for (let i = firstDay - 1; i >= 0; i--) {
      cells.push({
        day: daysInPrevMonth - i,
        isCurrent: false,
        dateStr: `${year}-${String(month).padStart(2, "0")}-${String(daysInPrevMonth - i).padStart(2, "0")}`,
      });
    }
    // 이번 달 날짜
    for (let i = 1; i <= daysInMonth; i++) {
      cells.push({
        day: i,
        isCurrent: true,
        dateStr: `${year}-${String(month + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`,
      });
    }
    // 다음 달 날짜
    const remaining = 35 - cells.length;
    for (let i = 1; i <= remaining; i++) {
      cells.push({
        day: i,
        isCurrent: false,
        dateStr: `${year}-${String(month + 2).padStart(2, "0")}-${String(i).padStart(2, "0")}`,
      });
    }
    return cells;
  };

  const cells = getCalendarCells();
  const selectedRecord = records[selectedDate];

  return (
    <>
      <PageTransition className="min-h-dvh w-full flex flex-col relative bg-[#FFFDF8] overflow-auto pb-24">
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
              <button onClick={prevMonth} className="p-1 active:scale-75 transition-transform">
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

              <button onClick={nextMonth} className="p-1 active:scale-75 transition-transform">
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
                const dayRecords = records[cell.dateStr];
                const firstRecord = dayRecords ? dayRecords[0] : null;
                const isSunday = idx % 7 === 0;

                return (
                  <div
                    key={idx}
                    onClick={() => cell.isCurrent && setSelectedDate(cell.dateStr)}
                    className={`relative flex justify-center items-center h-10 w-10 mx-auto ${cell.isCurrent ? "cursor-pointer" : "cursor-default opacity-40"}`}
                  >
                    {/* 기록이 있는 날짜 */}
                    {firstRecord && cell.isCurrent ? (
                      <div className="relative w-9 h-9 rounded-full overflow-hidden">
                        <img src={firstRecord.image} className="w-full h-full object-cover" />
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
                  </div>
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

          {records[selectedDate] && records[selectedDate].length > 0 ? (
            <div className="flex flex-col gap-4">
              {records[selectedDate].map((record) => (
                <div
                  key={record.id}
                  className="bg-[#FFECCD] rounded-[24px] px-5 py-4 flex justify-between items-center shadow-sm"
                >
                  <div>
                    <h4 className="text-[#F86516] font-bold text-[16px] mb-1">{record.restaurantName}</h4>
                    <p className="text-[#434343] font-medium text-[10px]">
                      {record.category} &nbsp; &nbsp; {record.visitDate} 방문
                    </p>
                  </div>

                  {/* 기록하기 영역 */}
                  <button className="flex flex-col items-center gap-2">
                    {record.isRecorded ? (
                      <>
                        <img src={CheckIcon} className="w-5 h-5" />
                        <span className="text-[#434343] text-[10px] font-medium">기록 완료</span>
                      </>
                    ) : (
                      <>
                        <img src={WriteIcon} onClick={() => navigate("/history/write")} className="w-5 h-5" />
                        <span className="text-[#434343] text-[10px] font-medium">기록하기</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[#FFFDF8] border-2 border-dashed border-[#FFECCD] rounded-[24px] p-6 flex justify-center items-center">
              <p className="text-[#F87816] font-semibold text-[14px]">이 날은 픽한 맛집이 없어요.</p>
            </div>
          )}
        </div>
      </PageTransition>

      {/* 네비게이션 바 */}
      <BottomNav />
    </>
  );
}
