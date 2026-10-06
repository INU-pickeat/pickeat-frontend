import { useNavigate, useLocation } from "react-router-dom";

const TAB_MENU = [
  { name: "캘린더", path: "/calendar" },
  { name: "pick 지도", path: "/map" },
  { name: "나의 기록", path: "/history" },
  { name: "pick 피드", path: "/feed" },
];

export default function TabMenu() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="flex w-full min-w-0 gap-2 overflow-x-auto scrollbar-hide mb-8">
      {TAB_MENU.map((tab) => {
        const isActive = location.pathname.includes(tab.path);

        return (
          <button
            key={tab.name}
            onClick={() => navigate(tab.path)}
            className={`flex-1 basis-0 min-w-[79px] h-9 px-2 rounded-full font-semibold text-[13px] whitespace-nowrap cursor-pointer transition-colors ${
              isActive ? "bg-[#F87816] text-[#FFF0DD] shadow-md font-bold" : "bg-[#FFECCD] text-[#F87816]"
            }`}
          >
            {tab.name}
          </button>
        );
      })}
    </div>
  );
}
