import { useLocation, useNavigate } from "react-router-dom";
import PageTransition from "../components/PageTransition";
import CharacterImg from "../assets/complete_character.png";
import Button from "../components/Button";
import { motion } from "framer-motion";
import { useState } from "react";
import NavigationLinksDialog from "../components/NavigationLinksDialog";

export default function CompleteSelect() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const selectedRestaurant = state?.selectedRestaurant;
  const restaurantId = state?.pick?.restaurantId || selectedRestaurant?.id;
  const [isNavigationOpen, setIsNavigationOpen] = useState(false);

  return (
    <PageTransition className="flex-1 w-full flex flex-col bg-gradient-to-b from-[#FAB47A95] to-[#ffffff] pb-14">
      <div className="flex-1 flex flex-col justify-center items-center gap-6 pt-8">
        <h2 className="text-[#F86516] text-[28px] text-center font-bold leading-relaxed">오늘의 Pick 완료!</h2>
        {selectedRestaurant && (
          <p className="text-[#F86516] text-[18px] text-center font-semibold px-6">{selectedRestaurant.name}</p>
        )}
        <motion.img
          src={CharacterImg}
          alt="캐릭터"
          className="w-32"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 180, damping: 15 }}
        />
        <p className="text-[#FF9639] text-[16px] text-center font-semibold leading-relaxed">
          즐거운 식사를 하고 기록도 해볼까요?
        </p>
      </div>

      {/* 길안내·공유 & 홈 이동 */}
      <div className="w-full px-6 flex flex-col items-center space-y-4">
        <div className="flex w-full gap-3">
          <Button
            onClick={() => setIsNavigationOpen(true)}
            disabled={!restaurantId}
            className="flex-1 shadow-none bg-[#FFECCD] text-[#F86516]! disabled:opacity-50"
          >
            길안내
          </Button>
          <Button onClick={() => alert("구현 예정입니다.")} className="flex-1 shadow-none bg-[#FFECCD] text-[#F86516]!">
            pick 공유
          </Button>
        </div>

        {/* 후기 작성 */}
        {state?.pick?.pickId && (
          <Button
            onClick={() => navigate(`/history/write?pickId=${encodeURIComponent(state.pick.pickId)}`, { state })}
            className="w-full shadow-none"
          >
            후기 작성하기
          </Button>
        )}
        <Button onClick={() => navigate("/home")} className="w-full shadow-none">
          홈화면 이동
        </Button>
      </div>

      {/* 길안내 지도 선택 */}
      {isNavigationOpen && (
        <NavigationLinksDialog restaurantId={restaurantId} onClose={() => setIsNavigationOpen(false)} />
      )}
    </PageTransition>
  );
}
