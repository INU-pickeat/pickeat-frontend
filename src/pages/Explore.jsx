import { Link, useParams } from "react-router-dom";
import PageTransition from "../components/PageTransition";
import LeftArrow from "../assets/arrow_left.svg";
import { exploreRegions, popularRestaurantsByRegion } from "../data/exploreRegions";

export default function Explore() {
  const { region } = useParams();
  const selectedRegion = exploreRegions.find((spot) => spot.slug === region);
  const restaurants = selectedRegion ? popularRestaurantsByRegion[region] : [];

  return (
    <PageTransition className="min-h-dvh w-full bg-[#FFFDF8] relative overflow-x-hidden overflow-y-auto scrollbar-none">
      {/* 배경 그라데이션 */}
      <div className="fixed top-0 -right-10 w-60 h-60 bg-[#F87816] rounded-full blur-[40px] opacity-60 -translate-y-1/4 translate-x-1/4 pointer-events-none z-0" />
      <div className="fixed top-1/2 left-0 w-60 h-60 bg-[#F87816] rounded-full blur-[40px] opacity-60 -translate-y-1/2 -translate-x-1/4 pointer-events-none z-0" />
      <div className="fixed bottom-0 right-0 w-60 h-60 bg-[#F87816] rounded-full blur-[40px] opacity-60 translate-y-1/4 translate-x-1/4 pointer-events-none z-0" />

      {/* 헤더 영역 */}
      <div className="pt-12 px-8 relative z-10 mb-8">
        <Link to="/home" aria-label="홈으로 돌아가기" className="w-6 h-6 mb-5 block">
          <img src={LeftArrow} alt="뒤로가기" className="w-6 h-6" />
        </Link>

        {/* 상단 텍스트 영역 */}
        <h1 className="text-[24px] font-bold text-[#F86516] leading-snug">
          {selectedRegion ? <>{selectedRegion.name} 인기 맛집</> : "지원하지 않는 지역이에요."}
        </h1>
        {selectedRegion && (
          <div className="text-[16px] font-medium text-[#FF8839]">
            picker들이 선정한 {selectedRegion.name} 인기 맛집
          </div>
        )}
      </div>

      {/* 카드 리스트 영역 */}
      <div className="px-6 pb-14 flex flex-col gap-4 relative">
        {restaurants.map((restaurant) => (
          <Link
            key={restaurant.id}
            to={`/restaurant/${restaurant.id}`}
            state={{ returnTo: `/explore/${region}` }}
            className="relative block w-full h-[210px] rounded-[24px] overflow-hidden shadow-[0_8px_20px_rgba(0,0,0,0.08)] group"
          >
            <img
              src={restaurant.image}
              alt={restaurant.name}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10" />

            {/* 번호 */}
            <div className="absolute top-6 left-6 w-7 h-7 bg-[#FF9639] text-white rounded-full flex items-center justify-center text-[14px] font-bold shadow-md">
              {restaurant.rank}
            </div>

            {/* 식당명 */}
            <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between gap-3 text-[14px] font-semibold">
              <span className="min-w-0 text-white">
                {restaurant.category} - {restaurant.name}
              </span>
              <span className="shrink-0 whitespace-nowrap text-white">
                {restaurant.pickCount}명의 <span className="text-[#FF9639]">pick</span>
              </span>
            </div>
          </Link>
        ))}

        {!selectedRegion && (
          <Link to="/home" className="relative z-10 text-[#F86516] font-semibold underline">
            홈에서 지역 다시 선택하기
          </Link>
        )}
      </div>
    </PageTransition>
  );
}
