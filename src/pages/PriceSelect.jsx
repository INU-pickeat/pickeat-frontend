import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import PageTransition from "../components/PageTransition";
import Button from "../components/Button";
import LeftArrow from "../assets/arrow_left.svg";

export default function PriceSelect() {
  const navigate = useNavigate();
  const location = useLocation();

  // 이전 페이지들에서 넘겨받은 데이터들 (위치, 상황, 카테고리)
  const situation = location.state?.situation || null;
  const category = location.state?.category || null;

  // 가격대 상태
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(20);
  const [isAnyPrice, setIsAnyPrice] = useState(false);

  // 최소 금액 변경 핸들러
  const handleMinChange = (e) => {
    const value = Math.min(Number(e.target.value), maxPrice - 1);
    setMinPrice(value);
    setIsAnyPrice(false);
  };

  // 최대 금액 변경 핸들러
  const handleMaxChange = (e) => {
    const value = Math.max(Number(e.target.value), minPrice + 1);
    setMaxPrice(value);
    setIsAnyPrice(false);
  };

  // 금액 포맷팅 함수
  const formatPrice = (val) => {
    if (val === 0) return "0원";
    if (val === 20) return "20만원+";
    return `${val}만원`;
  };

  return (
    <PageTransition className="h-dvh w-full flex flex-col relative bg-[#FFFDF8] px-6 pt-12 pb-10">
      <img src={LeftArrow} alt="뒤로가기" className="w-6 h-6 cursor-pointer" onClick={() => navigate(-1)} />

      {/* 헤더 영역 */}
      <div className="pt-6 flex flex-col items-center relative z-10 w-full">
        <h1 className="text-[22px] font-bold text-[#F87816] mb-3 text-center">
          1인당 원하는 가격대를 선택해주세요.
        </h1>
        <p className="text-[16px] font-medium text-[#FF9639]">한 끼에 생각하고 있는 예산을 알려주세요.</p>
      </div>

      <div
        className={`w-full flex flex-col items-center transition-opacity duration-300 ${isAnyPrice ? "opacity-40" : "opacity-100"}`}
      >
        {/* 커스텀 슬라이더 영역 */}
        <div className="px-2 w-full flex flex-col items-center mt-24 relative">
          <div className="relative w-full h-2 bg-[#FFECCD] rounded-full">
            <div
              className="absolute h-full bg-[#F86516] rounded-full pointer-events-none"
              style={{
                left: `${(minPrice / 20) * 100}%`,
                right: `${100 - (maxPrice / 20) * 100}%`,
              }}
            />

            {/* 최소 금액 슬라이더 */}
            <input
              type="range"
              min="0"
              max="20"
              value={minPrice}
              onChange={handleMinChange}
              className="absolute -top-[8px] w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#FF9639] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:shadow-md cursor-pointer"
            />

            {/* 최대 금액 슬라이더 */}
            <input
              type="range"
              min="0"
              max="20"
              value={maxPrice}
              onChange={handleMaxChange}
              className="absolute -top-[8px] w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#FF9639] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:shadow-md cursor-pointer"
            />
          </div>
        </div>

        {/* 슬라이더 하단 라벨 */}
        <div className="flex justify-between w-full mt-6 text-[10px] font-medium text-[#F87816]">
          <span>최소 금액 없음</span>
          <span>10만 원</span>
          <span>20만 원+</span>
        </div>

        {/* 현재 가격대 표시 박스 */}
        <div className="w-full max-w-[280px] bg-[#FFECCD] mt-14 py-3 rounded-full flex justify-center items-center font-medium text-[#F87816] text-[12px]">
          {formatPrice(minPrice)} ~ {formatPrice(maxPrice)}
        </div>
      </div>

      <div className="flex flex-col w-full items-center">
        {/* 상관없어요 버튼 */}
        <button
          onClick={() => setIsAnyPrice(!isAnyPrice)}
          className={`w-full max-w-[280px] mt-10 py-3 rounded-full font-medium text-[14px] transition-colors ${
            isAnyPrice ? "bg-[#FF9639] text-[#FFFDF8] shadow-md" : "bg-[#FFECCD] text-[#F87816] active:bg-[#FFECCD]/80"
          }`}
        >
          가격대는 상관없어요
        </button>
      </div>

      {/* 다음 버튼 */}
      <div className="mt-auto">
        <Button
          onClick={() => {
            const finalData = {
              situation,
              category,
              price: isAnyPrice ? "any" : { min: minPrice, max: maxPrice },
            };
            navigate("/recommend/loading", { state: finalData });
          }}
          className="shadow-none"
        >
          다음
        </Button>
      </div>
    </PageTransition>
  );
}
