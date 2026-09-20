import { useNavigate } from "react-router-dom";
import PageTransition from "../components/PageTransition";
import BottomNav from "../components/BottomNav";
import LeftArrow from "../assets/arrow_left.svg";

export default function Recent() {
  const navigate = useNavigate();

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
        <div className="mb-8">
          <h2 className="text-[22px] font-bold text-[#F86516] mb-2">최근 pick</h2>
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
                  className="w-full h-22 bg-[#FFECCD] rounded-2xl flex items-center justify-between p-4 shadow-sm"
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
