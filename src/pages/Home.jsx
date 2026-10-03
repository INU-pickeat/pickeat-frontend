import { useNavigate } from "react-router-dom";
import PageTransition from "../components/PageTransition";
import Button from "../components/Button";
import BottomNav from "../components/BottomNav";
import logoImg from "../assets/pickeat_logo.svg";
import CharacterImg from "../assets/home_character.png";

export default function Home() {
  const navigate = useNavigate();

  // 더미데이터
  const recentPicks = [
    {
      id: 1,
      name: "더미1",
      category: "일식",
      date: "5월 14일",
      visit: "3번째 방문",
      imgUrl: "/public/assets/dummy.jpg",
    },
    {
      id: 2,
      name: "더미2",
      category: "한식",
      date: "5월 14일",
      visit: "3번째 방문",
      imgUrl: "/public/assets/dummy.jpg",
    },
  ];

  const popularSpots = [
    { id: 1, name: "신사", imgUrl: "/public/assets/Sinsa.png" },
    { id: 2, name: "혜화", imgUrl: "/public/assets/Hyehwa.png" },
    { id: 3, name: "서촌", imgUrl: "/public/assets/Seochon.png" },
    { id: 4, name: "한남", imgUrl: "/public/assets/Hannam.png" },
    { id: 5, name: "종로", imgUrl: "/public/assets/Jongro.png" },
  ];

  return (
    <>
      <PageTransition className="h-dvh w-full flex flex-col relative bg-[#FFFDF8] overflow-hidden">
        {/* 배경 블러 & 스크롤 영역 */}
        <div className="absolute -top-20 -left-20 w-75 h-75 bg-[#FAB47A] opacity-60 blur-[70px] rounded-full pointer-events-none z-0"></div>
        <div className="relative z-10 flex-1 overflow-y-auto scrollbar-hide px-6 pt-10 pb-24">
          {/* 헤더 영역 */}
          <div className="flex justify-between items-center mb-8">
            <img src={logoImg} alt="pickeat 로고" className="w-22" />
            <button className="text-[#F86516] cursor-pointer" onClick={() => alert("추가 예정입니다.")}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
                />
              </svg>
            </button>
          </div>

          {/* 인사말 & 캐릭터 */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex flex-col">
              <h2 className="text-2xl font-bold text-[#F86516] mb-2">안녕하세요, 픽잇님!</h2>
              <p className="text-[16px] font-semibold text-[#434343]">오늘은 어디신가요?</p>
            </div>
            <img src={CharacterImg} alt="캐릭터" className="w-20" />
          </div>

          {/* 시작 버튼 */}
          <div className="text-[15px] font-semibold text-[#FFFBF2] mb-10">
            <Button
              onClick={() => navigate("/location")}
              className="bg-linear-to-r from-[#FF9639] to-[#F86516] border-none shadow-none"
            >
              위치기반 맛집추천 시작
            </Button>
          </div>

          {/* 최근 pick 영역 */}
          <div className="mb-10">
            <div className="flex justify-between items-end mb-4">
              <h3 className="text-[16px] font-semibold text-[#F86516] ml-3">최근 pick</h3>
              <button
                className="text-[12px] text-[#FF8839] font-medium hover:underline cursor-pointer"
                onClick={() => navigate("/recent")}
              >
                전체보기
              </button>
            </div>

            {/* 식당 카드 리스트 */}
            <div className="flex flex-col space-y-4">
              {recentPicks.map((pick) => (
                <div
                  onClick={() => alert("구현 예정입니다.")}
                  key={pick.id}
                  className="w-full h-[82px] bg-[#FFECCD] rounded-2xl flex items-center justify-between shadow-sm overflow-hidden"
                >
                  <div className="flex flex-col h-full justify-center space-y-2 pl-5 pr-2 py-3 flex-1">
                    <h4 className="text-[16px] font-bold text-[#F86516] truncate">{pick.name}</h4>
                    <div className="flex space-x-3 text-[13px] text-[#434343] font-medium">
                      <span>{pick.category}</span>
                      <span>{pick.date}</span>
                      <span>{pick.visit}</span>
                    </div>
                  </div>

                  {/* 이미지 플레이스홀더 */}
                  <div className="w-[82px] h-full bg-black/10 shrink-0">
                    {pick.imgUrl && <img src={pick.imgUrl} className="w-full h-full object-cover" />}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 인기 탐색 스팟 영역 */}
          <div>
            <h3 className="text-[16px] font-semibold text-[#F86516] mb-4">picker들의 지역별 인기 맛집</h3>
            <div className="flex justify-between items-start w-full pb-2">
              {popularSpots.map((spot) => (
                <div key={spot.id} className="flex flex-col items-center space-y-2">
                  <div
                    onClick={() => alert("구현 예정입니다.")}
                    className="w-14 h-14 rounded-full border-3 border-[#FFECCD] active:border-[#FF9639] transition-colors duration-200 bg-black/20 overflow-hidden shadow-sm cursor-pointer hover:border-[#FF9639]"
                  >
                    {spot.imgUrl && <img src={spot.imgUrl} className="w-full h-full object-cover" />}
                  </div>
                  <span className="text-[12px] font-semibold text-[#434343]">{spot.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </PageTransition>

      {/* 네비게이션 바 */}
      <BottomNav />
    </>
  );
}
