import { useNavigate, useLocation } from "react-router-dom";
import HomeIcon from "../../assets/icons/home.svg";
import MarkIcon from "../../assets/icons/mark.svg";
import ProfileIcon from "../../assets/icons/profile.svg";
import FeedIcon from "../../assets/icons/feed.svg";

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  // 탭 리스트 정의
  const tabs = [
    {
      path: "/home",
      name: "홈",
      activePaths: ["/home", "/recent", "/notifications"],
      icon: <img src={HomeIcon} alt="" />,
    },
    {
      path: "/calendar",
      name: "나의 pick",
      activePaths: ["/calendar", "/map", "/history"],
      icon: <img src={MarkIcon} alt="" />,
    },
    {
      path: "/feed",
      name: "피드",
      activePaths: ["/feed"],
      icon: <img src={FeedIcon} alt="" />,
    },
    {
      path: "/mypage",
      name: "마이페이지",
      activePaths: ["/mypage", "/mypage/edit"],
      icon: <img src={ProfileIcon} alt="" />,
    },
  ];

  return (
    // 위치 고정
    <nav
      aria-label="하단 메뉴"
      className="fixed bottom-[max(40px,env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 w-[calc(100%-44px)] max-w-[343px] h-[53px] bg-[#FFECCD]/90 rounded-full flex items-center justify-between px-[7px] z-50"
    >
      {tabs.map((tab) => {
        const isActive = tab.activePaths.includes(location.pathname);

        return (
          <button
            key={tab.path}
            aria-label={tab.name}
            aria-current={isActive ? "page" : undefined}
            onClick={() => navigate(tab.path)}
            // 현재 페이지일 경우 배경색 진하게
            className={`flex flex-1 justify-center items-center h-[41px] rounded-full transition-colors text-[#F86516] ${
              isActive ? "bg-[#FED4B3]" : "bg-transparent"
            } cursor-pointer`}
          >
            {tab.icon}
          </button>
        );
      })}
    </nav>
  );
}
