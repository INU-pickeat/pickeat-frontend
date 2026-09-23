import { useNavigate } from "react-router-dom";
import PageTransition from "../components/PageTransition";
import CharacterImg from "../assets/complete_character.png";
import Button from "../components/Button";
import { motion } from "framer-motion";

export default function CompleteSelect() {
  const navigate = useNavigate();

  return (
    <PageTransition className="flex-1 w-full flex flex-col bg-gradient-to-b from-[#FAB47A95] to-[#ffffff] pb-14">
      <div className="flex-1 flex flex-col justify-center items-center gap-6 pt-8">
        <h2 className="text-[#F86516] text-[28px] text-center font-bold leading-relaxed">오늘의 Pick 완료!</h2>
        <motion.img
          src={CharacterImg}
          alt="캐릭터"
          className="w-32"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 15 }}
        />
        <p className="text-[#FF9639] text-[16px] text-center font-semibold leading-relaxed">즐거운 시간 보내세요.</p>
      </div>

      {/* 각 버튼들 */}
      <div className="w-full px-6 flex flex-col items-center space-y-4">
        <div className="flex w-full gap-3">
          <Button onClick={() => alert("추가 예정입니다.")} className="flex-1 shadow-none">
            길안내
          </Button>
          <Button onClick={() => alert("추가 예정입니다.")} className="flex-1 shadow-none">
            pick 공유
          </Button>
        </div>

        <Button onClick={() => navigate("/home")} className="w-full shadow-none">
          홈화면 이동
        </Button>
      </div>
    </PageTransition>
  );
}
