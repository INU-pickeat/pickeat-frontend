import { restaurantShareUrl, shareRestaurantLink } from "../utils/shareRestaurant";
import { useLocation, useNavigate } from "react-router-dom";
import PageTransition from "../components/PageTransition";
import CharacterImg from "../assets/complete_character.png";
import Button from "../components/Button";
import { motion } from "framer-motion";
import { useRef, useState } from "react";
import NavigationLinksDialog from "../components/NavigationLinksDialog";
import SelectHome from "../assets/icons/select_home.svg";

export default function CompleteSelect() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const selectedRestaurant = state?.selectedRestaurant;
  const restaurantId = state?.pick?.restaurantId || selectedRestaurant?.id;
  const restaurantName = selectedRestaurant?.name || state?.pick?.restaurantName;
  const [isNavigationOpen, setIsNavigationOpen] = useState(false);
  const [shareMessage, setShareMessage] = useState("");
  const [isSharing, setIsSharing] = useState(false);
  const shareInFlight = useRef(false);

  /** 식당 상세 링크 공유 */
  async function handleShare() {
    if (!restaurantId || shareInFlight.current) return;
    const url = restaurantShareUrl(restaurantId);
    shareInFlight.current = true;
    setIsSharing(true);
    setShareMessage("");
    try {
      const result = await shareRestaurantLink({
        title: selectedRestaurant?.name || state?.pick?.restaurantName || "오늘의 Pick",
        url,
      });
      if (result === "copied") {
        setShareMessage("식당 상세 링크를 복사했어요.");
      } else if (result === "unsupported") {
        setShareMessage(url);
      }
    } catch (error) {
      if (error.name !== "AbortError") setShareMessage(url);
    } finally {
      shareInFlight.current = false;
      setIsSharing(false);
    }
  }

  return (
    <PageTransition className="min-h-dvh w-full flex flex-col bg-linear-to-b from-[#FAC598] via-[#FCEBD6] via-55% to-[#FFFDF8] to-78% pt-[12dvh] pb-[12dvh]">
      {/* 홈 이동 & 저장 완료 안내 */}
      <header className="px-[10%]">
        <button type="button" onClick={() => navigate("/home")} aria-label="홈으로 이동" className="block">
          <img src={SelectHome} alt="" />
        </button>
      </header>
      <div className="flex flex-col items-center mt-[7dvh]">
        <h2 className="text-[#F86516] text-[28px] text-center font-bold leading-snug px-6">오늘의 Pick 저장 완료!</h2>
        {restaurantName && (
          <p className="text-[#F86516] text-[16px] text-center font-semibold px-6 mt-5">{restaurantName}</p>
        )}
        <motion.img
          src={CharacterImg}
          alt="캐릭터"
          className="w-32 mt-[6dvh]"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 180, damping: 15 }}
        />
      </div>

      {/* 길안내·공유 & 기록하기 */}
      <div className="w-full px-6 flex flex-col items-center gap-3 mt-auto pt-10">
        <Button
          onClick={() => setIsNavigationOpen(true)}
          disabled={!restaurantId}
          className="h-[38px] shadow-none disabled:opacity-50"
        >
          길안내
        </Button>
        <div className="flex w-full gap-3">
          <Button
            onClick={handleShare}
            disabled={!restaurantId || isSharing}
            className="flex-1 h-[38px] shadow-none bg-[#FFECCD] text-[#F86516]! disabled:opacity-50"
          >
            pick 공유
          </Button>
          <Button
            onClick={() => navigate(`/history/write?pickId=${encodeURIComponent(state.pick.pickId)}`, { state })}
            disabled={!state?.pick?.pickId}
            className="flex-1 h-[38px] shadow-none bg-[#FFECCD] text-[#F86516]! disabled:opacity-50"
          >
            기록하기
          </Button>
        </div>

        {shareMessage && (
          <p role="status" className="w-full break-all text-center text-sm text-[#777777]">
            {shareMessage}
          </p>
        )}
      </div>

      {/* 길안내 지도 선택 */}
      {isNavigationOpen && (
        <NavigationLinksDialog restaurantId={restaurantId} onClose={() => setIsNavigationOpen(false)} />
      )}
    </PageTransition>
  );
}
