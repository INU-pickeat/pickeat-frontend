import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import PageTransition from "../components/PageTransition";
import Button from "../components/Button";
import LeftArrow from "../assets/arrow_left.svg";
import koreanIcon from "../assets/icons/Korean.svg";
import japaneseIcon from "../assets/icons/Japanese.svg";
import chineseIcon from "../assets/icons/Chinese.svg";
import italianIcon from "../assets/icons/Italian.svg";
import dessertIcon from "../assets/icons/dessert.svg";
import alcoholIcon from "../assets/icons/alcohol.svg";
import etcIcon from "../assets/icons/etc.svg";

const categories = [
  { id: "korean", label: "한식", icon: koreanIcon },
  { id: "japanese", label: "일식", icon: japaneseIcon },
  { id: "chinese", label: "중식", icon: chineseIcon },
  { id: "italian", label: "양식", icon: italianIcon },
  { id: "dessert", label: "커피, 디저트", icon: dessertIcon },
  { id: "alcohol", label: "펍, 와인, 술집", icon: alcoholIcon },
  { id: "etc", label: "기타", icon: etcIcon },
];

export default function CategorySelect() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedCategory, setSelectedCategory] = useState(null);

  // 이전 상황 선택 페이지에서 넘겨준 데이터 (선택)
  const situation = location.state?.situation || null;

  return (
    <PageTransition className="h-dvh w-full flex flex-col relative overflow-hidden bg-[#FFFDF8]">
      {/* 그라데이션 배경 */}
      <div
        className="absolute inset-0 w-full h-full z-0 blur-[60px] scale-125"
        style={{
          background: "radial-gradient(circle at center, #F87816 0%, #FFECCD 50%, #FFFDF8 100%)",
        }}
      />

      <div className="pt-12 px-6 flex flex-col items-center relative z-10">
        {/* 뒤로가기 버튼 */}
        <button
          onClick={() => navigate(-1)}
          className="absolute left-3 top-9 p-3 active:scale-90 transition-transform cursor-pointer"
        >
          <img src={LeftArrow} alt="뒤로가기" className="w-6 h-6" />
        </button>

        <h1 className="text-[24px] font-bold text-[#F86516] mt-8 mb-3">선호하는 음식 종류는?</h1>
        <p className="text-[14px] font-semibold text-[#F87816]">선호하는 음식을 선택해주세요.</p>
      </div>

      {/* 카드 스와이프 영역 */}
      <div className="flex-1 w-full flex flex-col justify-center relative z-10 -translate-y-2">
        <div
          className="flex w-full overflow-x-auto snap-x snap-mandatory gap-6 py-10 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] scrollbar-none scroll-smooth"
          style={{ paddingLeft: "calc(50% - 110px)", paddingRight: "calc(50% - 110px)" }}
        >
          {categories.map((item) => {
            const isSelected = selectedCategory === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setSelectedCategory(item.id)}
                className={`snap-center snap-always shrink-0 w-56 aspect-[3/4.2] rounded-[30px] flex flex-col items-center justify-center transition-all duration-300 ${
                  isSelected ? "bg-[#FFFDF8] scale-105" : "bg-[#FFFDF8] shadow-md scale-95"
                }`}
              >
                <img
                  src={item.icon}
                  alt={item.label}
                  className={`w-28 h-28 object-contain mb-8 transition-transform ${isSelected ? "scale-110" : ""}`}
                />
                <span
                  className={`text-[20px] ${isSelected ? "font-bold text-[#F86516]" : "font-bold text-[#F86516]/60"}`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 하단 버튼 영역 */}
      <div className="px-6 pb-10 mt-auto z-10">
        <Button
          disabled={!selectedCategory}
          onClick={() => {
            // 위치, 상황, 카테고리 데이터를 다음 페이지로 넘김
            navigate("/recommend/price", { state: { situation, category: selectedCategory } });
          }}
          className={!selectedCategory ? "opacity-50 cursor-not-allowed shadow-none" : "shadow-none"}
        >
          다음
        </Button>
      </div>
    </PageTransition>
  );
}
