import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import PageTransition from "../components/PageTransition";
import LeftArrow from "../assets/arrow_left.svg";
import TabMenu from "../components/TabMenu";
import BottomNav from "../components/BottomNav";

// 더미데이터
const mockHistory = [
  {
    id: 1,
    rawDate: "2026-10-02",
    date: "2026년 10월 2일",
    restaurantName: "야스노야지로 본점",
    tags: "친구와 함께 일식",
    image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=600&auto=format&fit=crop",
    review: "맛있는 양고기와 프라이빗한 공간~",
  },
  {
    id: 2,
    rawDate: "2026-09-20",
    date: "2026년 9월 20일",
    restaurantName: "더미2",
    tags: "가족과 함께 일식",
    image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=600&auto=format&fit=crop",
    review: "더미2 기록",
  },
];

export default function History() {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("일주일 기준");
  const [selectedRecord, setSelectedRecord] = useState(null);

  const today = new Date();

  // 필터링 및 날짜별 그룹화
  const groupedHistory = useMemo(() => {
    // 1. 선택된 기준에 따라 데이터 걸러내기
    const filtered = mockHistory.filter((item) => {
      const itemDate = new Date(item.rawDate);
      const diffTime = Math.abs(today - itemDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (selectedFilter === "일주일 기준") return diffDays <= 7;
      if (selectedFilter === "30일 기준") return diffDays <= 30;
      return true;
    });

    return filtered.reduce((acc, item) => {
      if (!acc[item.date]) acc[item.date] = [];
      acc[item.date].push(item);
      return acc;
    }, {});
  }, [selectedFilter, today]);

  const historyDates = Object.keys(groupedHistory);

  const handleSelectFilter = (filter) => {
    setSelectedFilter(filter);
    setIsDropdownOpen(false);
    // 추후 필터 변경 시 API 재호출 로직 추가 예정
  };

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

            <TabMenu />
          </div>

          {/* 메인 컨텐츠 영역 */}
          <div className="px-6 relative z-10 flex-1 pb-10">
            <div className="flex justify-between items-center mb-4">
              {/* 기록 날짜 */}
              <h2 className="text-[16px] font-semibold text-[#F87816] ml-3">
                {historyDates.length > 0 ? historyDates[0] : ""}
              </h2>

              {/* 기준 선택 영역 */}
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-1 text-[#F87816] active:opacity-60 transition-opacity cursor-pointer"
                >
                  <span className="text-[12px] font-semibold leading-none">{selectedFilter}</span>
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
                  <div className="absolute right-0 top-full mt-2 w-26 bg-[#FFFDF8] border-[1.5px] border-[#F86516] rounded-xl shadow-lg z-50 flex flex-col overflow-hidden">
                    <button
                      onClick={() => handleSelectFilter("일주일 기준")}
                      className={`py-2 text-[14px] font-bold transition-colors ${selectedFilter === "일주일 기준" ? "text-[#F86516] bg-[#FFECCD]" : "text-[#434343] active:bg-gray-50"}`}
                    >
                      일주일 기준
                    </button>
                    <div className="w-full h-px bg-[#F86516]/30"></div>
                    <button
                      onClick={() => handleSelectFilter("30일 기준")}
                      className={`py-2 text-[14px] font-bold transition-colors ${selectedFilter === "30일 기준" ? "text-[#F86516] bg-[#FFECCD]" : "text-[#434343] active:bg-gray-50"}`}
                    >
                      30일 기준
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* 기록 카드 리스트 영역 */}
            {historyDates.length > 0 ? (
              <div className="flex flex-col gap-6">
                {historyDates.map((dateStr, index) => (
                  <div key={dateStr}>
                    {index > 0 && <h2 className="text-[16px] font-semibold text-[#F87816] ml-3 mb-4">{dateStr}</h2>}

                    <div className="flex flex-col gap-6">
                      {/* 해당 날짜에 속한 카드들만 렌더링 */}
                      {groupedHistory[dateStr].map((item) => (
                        <div
                          key={item.id}
                          onClick={() => setSelectedRecord(item)} // 카드 클릭 시 모달 띄우기
                          className="w-full rounded-[24px] overflow-hidden cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.06)] active:scale-[0.98] transition-transform"
                        >
                          <div className="relative w-full h-36">
                            <img src={item.image} alt={item.restaurantName} className="w-full h-full object-cover" />

                            {/* 수정 & 삭제 아이콘 */}
                            <div className="absolute top-0 left-0 w-full h-16 bg-gradient-to-b from-black/50 to-transparent flex justify-end items-start pt-4 pr-4 gap-3">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate("/history/write", { state: { record: item } });
                                }}
                                className="active:scale-90 transition-transform"
                              >
                                <svg
                                  width="20"
                                  height="20"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="white"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                </svg>
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  alert("구현 예정입니다.");
                                }}
                                className="active:scale-90 transition-transform"
                              >
                                <svg
                                  width="20"
                                  height="20"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="white"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <polyline points="3 6 5 6 21 6" />
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                </svg>
                              </button>
                            </div>
                          </div>

                          {/* 식당 정보 영역 */}
                          <div className="bg-[#FFECCD] px-5 py-4 flex justify-between items-center">
                            <h3 className="text-[#F86516] font-bold text-[16px]">{item.restaurantName}</h3>
                            <span className="text-[#F87816] font-medium text-[12px]">{item.tags}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // 필터링 결과가 없을 때
              <div className="bg-[#FFFDF8] border-2 border-dashed border-[#FFECCD] rounded-[24px] p-10 flex flex-col items-center justify-center mt-4">
                <p className="text-center text-[#F87816] font-semibold text-[14px]">
                  {selectedFilter} 내에 기록한 맛집이 없어요.
                </p>
              </div>
            )}
          </div>

          {/* 상세 기록 모달 */}
          {selectedRecord && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-6 backdrop-blur-sm animate-fade-in"
              onClick={() => setSelectedRecord(null)}
            >
              <div
                className="w-full max-w-sm bg-[#FFECCD] rounded-[24px] overflow-hidden shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                {/* 기록 이미지 */}
                <div className="relative w-full h-50">
                  <img src={selectedRecord.image} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end px-5 py-4">
                    <div className="flex justify-between items-end gap-2">
                      <h2 className="text-[#FFFDF8] font-bold text-[16px] truncate">{selectedRecord.restaurantName}</h2>
                      <span className="text-[#FFFDF8] text-[12px] font-medium shrink-0 mb-0.5">
                        {selectedRecord.tags}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 기록 내용 */}
                <div className="px-5 py-6 min-h-[120px]">
                  <p className="text-[#686767] text-[14px] font-medium leading-relaxed">{selectedRecord.review}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </PageTransition>

      {/* 네비게이션 바 */}
      <BottomNav />
    </>
  );
}
