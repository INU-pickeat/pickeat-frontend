import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageTransition from "../components/PageTransition";
import Button from "../components/Button";
import LeftArrow from "../assets/arrow_left.svg";
import dateIcon from "../assets/icons/date.svg";
import familyIcon from "../assets/icons/family.svg";
import kidsIcon from "../assets/icons/kids.svg";
import soloIcon from "../assets/icons/solo.svg";
import groupIcon from "../assets/icons/group.svg";
import petIcon from "../assets/icons/pet.svg";

const situations = [
  { id: "date", label: "데이트", icon: dateIcon },
  { id: "family", label: "가족과 함께", icon: familyIcon },
  { id: "kids", label: "아이와 함께", icon: kidsIcon },
  { id: "solo", label: "혼밥", icon: soloIcon },
  { id: "group", label: "단체, 회식", icon: groupIcon },
  { id: "pet", label: "반려견과 함께", icon: petIcon },
];

export default function SituationSelect() {
  const navigate = useNavigate();
  const [selectedSituation, setSelectedSituation] = useState(null); // 현재 선택된 상황 상태

  return (
    <PageTransition className="h-dvh w-full flex flex-col bg-[#FFFDF8] px-6 pt-12 pb-10">
      {/* 뒤로가기 버튼 */}
      <img src={LeftArrow} alt="뒤로가기" className="w-6 h-6 cursor-pointer" onClick={() => navigate(-1)} />

      {/* 타이틀 */}
      <div className="relative flex flex-col items-center mb-6 z-10">
        <h1 className="text-[24px] font-bold text-[#F86516] mt-2 mb-3">어떤 상황인가요?</h1>
        <p className="text-[16px] font-medium text-[#FF9639]">현재 상황을 선택해주세요.</p>
      </div>

      {/* 상황 카드 영역 */}
      <div className="flex-1 w-full flex flex-col justify-center">
        <div className="grid grid-cols-2 gap-x-4 gap-y-5">
          {situations.map((item) => {
            const isSelected = selectedSituation === item.id; // 현재 카드가 선택된 카드인지 판별

            return (
              <button
                key={item.id}
                onClick={() => setSelectedSituation(item.id)}
                className={`flex flex-col items-center justify-center aspect-4.5/3 rounded-2xl transition-all duration-200 ${
                  isSelected ? "bg-[#FFECCD] shadow-lg" : "bg-[#FFECCD] active:bg-[#FFECCD]"
                }`}
              >
                <img
                  src={item.icon}
                  alt={item.label}
                  className={`w-14 h-14 object-contain transition-transform ${isSelected ? "scale-110" : ""}`}
                />
                <span
                  className={`text-[14px] mb-2 ${isSelected ? "font-bold text-[#F86516]" : "font-semibold text-[#6A6A6A]"}`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 다음 버튼 */}
      <div className="pt-8 mt-auto">
        <Button
          disabled={!selectedSituation}
          onClick={() => {
            navigate("/recommend/category", { state: { situation: selectedSituation } });
          }}
          className={!selectedSituation ? "opacity-50 cursor-not-allowed shadow-none" : "shadow-none"}
        >
          다음
        </Button>
      </div>
    </PageTransition>
  );
}
