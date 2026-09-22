import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageTransition from "../components/PageTransition";
import BottomNav from "../components/BottomNav";
import LeftArrow from "../assets/arrow_left.svg";

export default function Recent() {
  // 토글 상태 관리
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("일주일 기준");

  const navigate = useNavigate();

  // 토글 선택 핸들러
  const handleSelectFilter = (filter) => {
    setSelectedFilter(filter);
    setIsDropdownOpen(false); // 선택 후 드롭다운 닫기
    // 이후 서버 연동 로직 추가
  };

  // 날짜 변환 함수
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
  };

  // 임시 더미데이터
  const picksData = [
    {
      id: 1,
      date: "2026-07-20",
      name: "야스노야지로 본점",
      category: "일식",
      desc: "5월 14일",
      visit: "3번째 방문",
      imgUrl: "",
    },
    { id: 2, date: "2026-07-20", name: "초원", category: "한식", desc: "5월 12일 방문", visit: "", imgUrl: "" },
    { id: 3, date: "2026-07-18", name: "동래정 본점", category: "한식", desc: "5월 12일 방문", visit: "", imgUrl: "" },
  ];

  // 날짜별로 데이터 그룹화
  const groupedPicks = picksData.reduce((acc, pick) => {
    const formattedDate = formatDate(pick.date);
    if (!acc[formattedDate]) {
      acc[formattedDate] = [];
    }
    acc[formattedDate].push(pick);
    return acc;
  }, {});

  return (
    <PageTransition className="h-dvh w-full flex flex-col relative bg-[#FFFDF8] overflow-hidden">
      <div className="relative z-10 flex-1 overflow-y-auto scrollbar-hide px-6 pt-10 pb-24">
        {/* 뒤로가기 버튼 */}
        <img src={LeftArrow} alt="뒤로가기" className="w-6 h-6 mb-6 cursor-pointer" onClick={() => navigate(-1)} />

        {/* 타이틀 & 정렬 토글 */}
        <div className="flex justify-between mb-8">
          <h2 className="text-[22px] font-bold text-[#F86516] leading-none">최근 pick</h2>

          <div className="relative mt-1 ">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-1 text-[#F86516] active:opacity-60 transition-opacity cursor-pointer"
            >
              <span className="text-[14px] font-bold leading-none">{selectedFilter}</span>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>

            {/* 드롭다운 메뉴 */}
            {isDropdownOpen && (
              <div className="absolute right-0 top-full mt-1 w-26 bg-[#FFFDF8] border-[1.5px] border-[#FF9639] rounded-xl shadow-lg z-50 flex flex-col overflow-hidden">
                <button
                  onClick={() => handleSelectFilter("일주일 기준")}
                  className={`py-2 text-[14px] font-bold transition-colors ${
                    selectedFilter === "일주일 기준"
                      ? "text-[#F86516] bg-[#FFECCD]"
                      : "text-[#434343] active:bg-gray-50"
                  }`}
                >
                  일주일 기준
                </button>
                <div className="w-full h-px bg-[#FF9639]/30"></div>
                <button
                  onClick={() => handleSelectFilter("30일 기준")}
                  className={`py-2.5 text-[14px] font-bold transition-colors ${
                    selectedFilter === "30일 기준" ? "text-[#F86516] bg-[#FFECCD]" : "text-[#434343] active:bg-gray-50"
                  }`}
                >
                  30일 기준
                </button>
              </div>
            )}
          </div>
        </div>

        {Object.entries(groupedPicks).map(([date, items], index) => (
          <div key={date} className={index > 0 ? "mt-8" : ""}>
            {/* 날짜 헤더 */}
            <h2 className="text-[16px] font-bold text-[#F86516] mb-3">{date}</h2>

            {/* 식당 카드 리스트 */}
            <div className="flex flex-col space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="w-full h-20 bg-[#FFECCD] rounded-2xl flex items-center justify-between p-4 shadow-sm"
                >
                  <div className="flex flex-col h-full justify-center space-y-2">
                    <h4 className="text-[17px] font-bold text-[#F86516]">{item.name}</h4>
                    <div className="flex space-x-3 text-[12px] text-[#434343] font-medium">
                      <span>{item.category}</span>
                      <span>{item.desc}</span>
                      {item.visit && <span>{item.visit}</span>}
                    </div>
                  </div>

                  {/* 식당 썸네일 */}
                  <div className="w-16 h-16 bg-black/20 rounded-lg shrink-0 overflow-hidden">
                    {item.imgUrl && <img src={item.imgUrl} alt={item.name} className="w-full h-full object-cover" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 하단바 */}
      <BottomNav />
    </PageTransition>
  );
}
