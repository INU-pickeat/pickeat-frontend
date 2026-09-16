import { useNavigate } from "react-router-dom";
import logoImg from "../assets/pickeat_logo.svg";

export default function Intro() {
  const navigate = useNavigate();

  return (
    <div className="flex-1 w-full flex flex-col bg-gradient-to-b from-[#FAB47A95] to-[#ffffff] pb-18">
      <div className="flex-1 flex flex-col justify-center items-center">
        <img src={logoImg} alt="pickeat 로고" className="w-36 mb-6" />
        <p className="text-[#fd772e] text-[16px] text-center font-medium leading-relaxed">
          고민 없이 취향대로
          <br />내 현재 위치의 맛집을 PICK
        </p>
      </div>

      <div className="w-full px-6 flex flex-col items-center space-y-6">
        {/* 로그인 버튼 */}
        <button
          onClick={() => navigate("/login")}
          className="w-full h-10 bg-[#FF9639] text-white font-bold text-[14px] rounded-full shadow-lg shadow-orange-500/30 active:scale-95 transition-transform"
        >
          로그인
        </button>

        {/* 회원가입 문구 */}
        <p className="text-sm text-[#FF8223]/70 font-medium">
          이미 계정이 있으신가요?{" "}
          <button
            onClick={() => navigate("/signup")}
            className="text-[#FF8223] font-bold hover:underline ml-1 active:opacity-70"
          >
            회원가입
          </button>
        </p>
      </div>
    </div>
  );
}
