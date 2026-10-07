import { Link, useNavigate } from "react-router-dom";
import PageTransition from "../components/PageTransition";
import DefaultProfile from "../assets/profile_default.png";
import BottomNav from "../components/BottomNav";
import { useRef, useState } from "react";
import { logout } from "../api/auth";
import useMyInfo from "../hooks/useMyInfo";

export default function MyPage() {
  const navigate = useNavigate();
  const { member, isLoading, error, needsLogin, retry } = useMyInfo();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const logoutInFlight = useRef(false);

  /** 로그아웃 처리 */
  const handleLogout = async () => {
    if (logoutInFlight.current) return;
    logoutInFlight.current = true;
    setIsLoggingOut(true);

    try {
      await logout();
    } catch {
      alert("서버 로그아웃을 확인하지 못했어요. 이 기기의 로그인 정보는 삭제했어요.");
    } finally {
      navigate("/", { replace: true });
    }
  };

  // 메뉴 그룹 데이터
  const menuGroup1 = [
    { id: 1, title: "알림 설정" },
    { id: 2, title: "화면 테마" },
    { id: 3, title: "이용약관" },
  ];

  const menuGroup2 = [
    { id: 4, title: "서비스 정보" },
    { id: 5, title: "로그아웃" },
  ];

  /** 메뉴 렌더링 */
  const renderMenu = (menuList) => (
    <div className="w-full bg-[#FFECCD] rounded-2xl px-5 py-2 shadow-sm">
      {menuList.map((menu) => (
        <button
          key={menu.id}
          disabled={isLoggingOut}
          onClick={() => {
            if (menu.title === "로그아웃") {
              handleLogout();
            } else alert("추가 예정입니다.");
          }}
          className="w-full flex justify-between items-center py-3 active:opacity-60 transition-opacity cursor-pointer"
        >
          <span className="text-[15px] font-medium text-[#434343]">{menu.title}</span>
          {/* 오른쪽 화살표 아이콘 */}
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            className="w-4 h-4 text-[#FF9639]"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      ))}
    </div>
  );

  return (
    <>
      <PageTransition className="h-dvh w-full flex flex-col relative bg-[#FFFDF8] overflow-hidden">
        {/* 내부 스크롤 영역 */}
        <div className="flex-1 overflow-y-auto scrollbar-hide px-6 pt-16 pb-28">
          {/* 상단 프로필 영역 */}
          {isLoading && (
            <p role="status" className="mb-10 text-sm text-[#777777]">
              내 정보를 불러오는 중이에요.
            </p>
          )}
          {error && (
            <div role="alert" className="mb-10 text-sm text-[#777777]">
              <p>{error}</p>
              {needsLogin ? (
                <Link to="/login" className="mt-3 inline-block text-[#F86516] underline">
                  로그인하기
                </Link>
              ) : (
                <button type="button" onClick={retry} className="mt-3 text-[#F86516] underline cursor-pointer">
                  다시 시도
                </button>
              )}
            </div>
          )}
          {member && (
            <div className="flex items-center space-x-4 mb-10">
              {/* 프로필 이미지 */}
              <div className="w-14 h-14 rounded-full overflow-hidden bg-[#F86516] flex items-center justify-center shrink-0 shadow-sm">
                <img
                  src={member.profileImageUrl || DefaultProfile}
                  alt="프로필 이미지"
                  className="w-full h-full object-cover"
                  onError={(event) => {
                    if (event.currentTarget.getAttribute("src") !== DefaultProfile)
                      event.currentTarget.src = DefaultProfile;
                  }}
                />
              </div>

              {/* 유저 이름 및 정보 수정 */}
              <div className="min-w-0 flex flex-col justify-center">
                <h2 className="text-[19px] font-bold text-[#F86516] mb-1">{member.nickname}님 안녕하세요.</h2>
                {member.bio?.trim() && <p className="mb-2 text-[12px] leading-relaxed text-[#777777]">{member.bio}</p>}
                <button
                  onClick={() => alert("구현 예정입니다.")}
                  className="text-[12px] text-[#FF8839] font-semibold text-left hover:underline w-fit cursor-pointer"
                >
                  내 정보 수정
                </button>
              </div>
            </div>
          )}

          {/* 메뉴 리스트 영역 */}
          <div className="flex flex-col space-y-5">
            {renderMenu(menuGroup1)}
            {renderMenu(menuGroup2)}
          </div>
        </div>
      </PageTransition>

      {/* 네비게이션 바 */}
      <BottomNav />
    </>
  );
}
