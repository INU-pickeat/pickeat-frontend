import { useNavigate, useLocation } from "react-router-dom";
import HomeIcon from "../assets/home.svg";
import MarkIcon from "../assets/mark.svg";
import ProfileIcon from "../assets/profile.svg";

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  // 탭 리스트 정의
  const tabs = [
    {
      path: "/home",
      icon: <img src={HomeIcon} alt="홈 아이콘" className="w-6 h-6" />,
    },
    {
      path: "/calendar",
      icon: <img src={MarkIcon} alt="마크 아이콘" className="w-6 h-6" />,
    },
    {
      path: "/mypage",
      icon: <img src={ProfileIcon} alt="프로필 아이콘" className="w-6 h-6" />,
    },
  ];

  return (
    // 위치 고정
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-68 h-12 bg-[#FFECCDE5] rounded-full flex items-center justify-between px-2 shadow-sm z-50">
      {tabs.map((tab) => {
        const isActive = location.pathname === tab.path;
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            // 현재 페이지일 경우 배경색 진하게
            className={`flex justify-center items-center w-18 h-10 rounded-full transition-colors text-[#FF9639] ${
              isActive ? "bg-[#FFD5B1]" : "bg-transparent"
            } cursor-pointer`}
          >
            {tab.icon}
          </button>
        );
      })}
    </div>
  );
}
