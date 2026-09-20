import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageTransition from "../components/PageTransition";
import Button from "../components/Button";

export default function Signup() {
  const navigate = useNavigate();

  // 입력 상태 관리
  const [formData, setFormData] = useState({
    nickname: "",
    email: "",
    code: "",
    password: "",
    passwordConfirm: "",
  });

  // 에러 메시지 상태 관리
  const [errors, setErrors] = useState({
    nickname: "",
    email: "",
    code: "",
    password: "",
    passwordConfirm: "",
  });

  // 입력 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // 사용자가 입력하기 시작하면 해당 항목의 에러 메시지를 지워줌
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // 회원가입 버튼 클릭 시 프론트엔드 유효성 검사
  const handleSignup = () => {
    let newErrors = {};
    let isValid = true;

    if (!formData.nickname) {
      newErrors.nickname = "닉네임은 필수 입력 항목입니다.";
      isValid = false;
    }
    if (!formData.email) {
      newErrors.email = "이메일은 필수 입력 항목입니다.";
      isValid = false;
    }
    if (!formData.code) {
      newErrors.code = "인증번호가 틀렸습니다."; // 임시 에러
      isValid = false;
    }
    if (!formData.password) {
      newErrors.password = "비밀번호는 필수 입력 항목입니다.";
      isValid = false;
    }
    if (!formData.passwordConfirm || formData.password !== formData.passwordConfirm) {
      newErrors.passwordConfirm = "비밀번호 확인이 틀렸습니다.";
      isValid = false;
    }

    setErrors(newErrors);

    // 에러가 없으면 다음 플로우로 이동
    if (isValid) {
      alert("회원가입 성공!");
      navigate("/login");
    }
  };

  return (
    <PageTransition className="flex-1 w-full flex flex-col justify-center bg-[#FFFDF8] px-6 pt-10 pb-20 overflow-y-auto scrollbar-hide">
      {/* 타이틀 */}
      <div className="w-full flex justify-center mt-4 mb-10">
        <h1 className="text-2xl font-bold text-[#F86516]">회원가입</h1>
      </div>

      <div className="w-full flex flex-col space-y-6">
        {/* 닉네임 */}
        <div className="flex flex-col space-y-2">
          <label className="text-[#FF8223] text-sm font-semibold ml-4">닉네임</label>
          <input
            type="text"
            name="nickname"
            value={formData.nickname}
            onChange={handleChange}
            placeholder="닉네임을 입력해주세요."
            className="w-full h-10 rounded-full border-[1.5px] border-[#FF8223] px-5 text-sm bg-transparent placeholder-[#FFBE85] focus:outline-none focus:ring-2 focus:ring-[#f87816]/30"
          />
          {errors.nickname && <p className="text-[#FF5C5C] text-xs font-semibold ml-4 mt-1">{errors.nickname}</p>}
        </div>

        {/* 이메일 & 인증하기 버튼 */}
        <div className="flex flex-col space-y-2">
          <label className="text-[#FF8223] text-sm font-semibold ml-4">이메일</label>
          <div className="flex space-x-2">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="이메일을 입력해주세요."
              className="flex-1 min-w-0 h-10 rounded-full border-[1.5px] border-[#FF8223] px-5 text-sm bg-transparent placeholder-[#FFBE85] focus:outline-none focus:ring-2 focus:ring-[#f87816]/30"
            />
            <button
              type="button"
              className="w-18 shrink-0 h-10 bg-[#FF9639] text-white text-[12px] font-semibold rounded-full active:scale-95 transition-transform cursor-pointer"
            >
              인증하기
            </button>
          </div>
          {errors.email && <p className="text-[#FF5C5C] text-xs font-semibold ml-4 mt-1">{errors.email}</p>}
        </div>

        {/* 인증번호 */}
        <div className="flex flex-col space-y-2">
          <label className="text-[#FF8223] text-sm font-semibold ml-4">인증번호</label>
          <input
            type="text"
            name="code"
            value={formData.code}
            onChange={handleChange}
            placeholder="인증번호를 입력해주세요."
            className="w-full h-10 rounded-full border-[1.5px] border-[#FF8223] px-5 text-sm bg-transparent placeholder-[#FFBE85] focus:outline-none focus:ring-2 focus:ring-[#f87816]/30"
          />
          <div className="flex justify-between items-start px-4 pt-1">
            <span className="text-[#FF5C5C] text-xs font-semibold">{errors.code}</span>
            <button type="button" className="text-[#FF8223] text-xs font-medium hover:underline cursor-pointer">
              인증번호 재발송
            </button>
          </div>
        </div>

        {/* 비밀번호 */}
        <div className="flex flex-col space-y-2">
          <label className="text-[#FF8223] text-sm font-semibold ml-4">비밀번호</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="비밀번호를 입력해주세요."
            className="w-full h-10 rounded-full border-[1.5px] border-[#FF8223] px-5 text-sm bg-transparent placeholder-[#FFBE85] focus:outline-none focus:ring-2 focus:ring-[#f87816]/30"
          />
          {errors.password && <p className="text-[#FF5C5C] text-xs font-semibold ml-4 mt-1">{errors.password}</p>}
        </div>

        {/* 비밀번호 확인 */}
        <div className="flex flex-col space-y-2">
          <label className="text-[#FF8223] text-sm font-semibold ml-4">비밀번호 확인</label>
          <input
            type="password"
            name="passwordConfirm"
            value={formData.passwordConfirm}
            onChange={handleChange}
            placeholder="비밀번호를 입력해주세요."
            className="w-full h-10 rounded-full border-[1.5px] border-[#FF8223] px-5 text-sm bg-transparent placeholder-[#FFBE85] focus:outline-none focus:ring-2 focus:ring-[#f87816]/30"
          />
          {errors.passwordConfirm && (
            <p className="text-[#FF5C5C] text-xs font-semibold ml-4 mt-1">{errors.passwordConfirm}</p>
          )}
        </div>
      </div>

      <div className="mt-12 mb-8">
        <Button onClick={handleSignup}>회원가입</Button>
      </div>
    </PageTransition>
  );
}
