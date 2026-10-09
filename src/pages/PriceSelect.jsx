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
  const [hasSelectedPrice, setHasSelectedPrice] = useState(false);
  const canContinue = isAnyPrice || hasSelectedPrice;

  /** 최소 금액 선택 */
  const handleMinChange = (e) => {
    const value = Math.min(Number(e.target.value), maxPrice);
    setMinPrice(value);
    setIsAnyPrice(false);
    setHasSelectedPrice(true);
  };

  /** 최대 금액 선택 */
  const handleMaxChange = (e) => {
    const value = Math.max(Number(e.target.value), minPrice);
    setMaxPrice(value);
    setIsAnyPrice(false);
    setHasSelectedPrice(true);
  };

  /** 금액 표시 */
  const formatPrice = (val) => {
    if (val === 0) return "0원";
    if (val === 20) return "20만원";
    return `${val}만원`;
  };

  return (
    <PageTransition className="h-dvh w-full flex flex-col relative bg-[#FFFDF8] px-6 pt-12 pb-10">
      <img src={LeftArrow} alt="뒤로가기" className="w-6 h-6 cursor-pointer" onClick={() => navigate(-1)} />

      {/* 헤더 영역 */}
      <div className="pt-6 flex flex-col items-center relative z-10 w-full">
        <h1 className="text-[22px] font-bold text-[#F87816] mb-3 text-center">1인당 원하는 가격대를 선택해주세요.</h1>
        <p className="text-[16px] font-medium text-[#FF9639]">한 끼에 생각하고 있는 예산을 알려주세요.</p>
      </div>

      <div
        className={`w-full flex flex-col items-center transition-opacity duration-300 ${isAnyPrice ? "opacity-40" : "opacity-100"}`}
      >
        {/* 커스텀 슬라이더 영역 */}
        <div className="px-3 w-full flex flex-col items-center mt-24 relative">
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
              aria-label="최소 금액"
              min="0"
              max="20"
              value={minPrice}
              onChange={handleMinChange}
              className="absolute -left-3 -top-[8px] m-0 w-[calc(100%+24px)] appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#FF9639] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#FF9639] cursor-pointer"
            />

            {/* 최대 금액 슬라이더 */}
            <input
              type="range"
              aria-label="최대 금액"
              min="0"
              max="20"
              value={maxPrice}
              onChange={handleMaxChange}
              className="absolute -left-3 -top-[8px] m-0 w-[calc(100%+24px)] appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#FF9639] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#FF9639] cursor-pointer"
            />
          </div>
        </div>

        {/* 슬라이더 하단 라벨 */}
        <div className="relative flex justify-between w-full mt-6 text-[10px] font-medium text-[#F87816]">
          <span>최소 금액 없음</span>
          <span className="absolute left-1/2 -translate-x-1/2">10만 원</span>
          <span>20만 원</span>
        </div>

        {/* 가격대 드롭다운 — 슬라이더와 함께 변경 */}
        <div className="w-full max-w-[280px] bg-[#FFECCD] mt-14 px-4 py-3 rounded-full flex justify-center items-center gap-3 font-medium text-[#F87816] text-[12px]">
          <select
            aria-label="최소 금액 선택"
            value={hasSelectedPrice ? minPrice : ""}
            onChange={handleMinChange}
            className="min-w-0 flex-1 bg-transparent text-center outline-none"
          >
            <option value="" disabled>
              최소 금액
            </option>
            {Array.from({ length: 21 }, (_, value) => (
              <option key={value} value={value} disabled={value > maxPrice}>
                {formatPrice(value)}
              </option>
            ))}
          </select>
          <span>~</span>
          <select
            aria-label="최대 금액 선택"
            value={hasSelectedPrice ? maxPrice : ""}
            onChange={handleMaxChange}
            className="min-w-0 flex-1 bg-transparent text-center outline-none"
          >
            <option value="" disabled>
              최대 금액
            </option>
            {Array.from({ length: 21 }, (_, value) => (
              <option key={value} value={value} disabled={value < minPrice}>
                {formatPrice(value)}
              </option>
            ))}
          </select>
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
          disabled={!canContinue}
          onClick={() => {
            if (!canContinue) return;
            const finalData = {
              ...location.state,
              situation,
              category,
              price: isAnyPrice ? "any" : { min: minPrice, max: maxPrice },
            };
            navigate("/recommend/loading", { state: finalData });
          }}
          className="shadow-none disabled:opacity-50"
        >
          다음
        </Button>
      </div>
    </PageTransition>
  );
}
