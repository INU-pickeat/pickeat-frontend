import { useNavigate } from "react-router-dom";
import PageTransition from "../components/PageTransition";
import logoImg from "../assets/pickeat_logo.svg";
import CharacterImg from "../assets/character.png";
import Button from "../components/Button";

export default function Intro() {
  const navigate = useNavigate();

  return (
    <PageTransition className="flex-1 w-full flex flex-col bg-gradient-to-b from-[#FAB47A95] to-[#ffffff] pb-18">
      <div className="flex-1 flex flex-col justify-center items-center gap-6">
        <img src={logoImg} alt="pickeat 로고" className="w-36" />
        <p className="text-[#fd772e] text-[16px] text-center font-medium leading-relaxed">
          고민 없이 취향대로
          <br />내 현재 위치의 맛집을 PICK
        </p>
        <img src={CharacterImg} alt="캐릭터" className="w-40 mt-8" />
      </div>

      <div className="w-full px-6 flex flex-col items-center space-y-6">
        {/* 로그인 버튼 */}
        <Button onClick={() => navigate("/login")}>로그인</Button>

        {/* 회원가입 문구 */}
        <p className="text-sm text-[#FF8223]/70 font-medium">
          이미 계정이 있으신가요?{" "}
          <button
            onClick={() => navigate("/signup")}
            className="text-[#FF8223] font-bold hover:underline ml-1 active:opacity-70 cursor-pointer"
          >
            회원가입
          </button>
        </p>
      </div>
    </PageTransition>
  );
}
