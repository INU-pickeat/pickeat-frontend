import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageTransition from "../components/PageTransition";
import Button from "../components/Button";

export default function ResetPassword() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    code: "",
    newPassword: "",
    newPasswordConfirm: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    alert("비밀번호가 성공적으로 변경되었습니다.");
    navigate("/login");
  };

  return (
    <PageTransition className="flex-1 w-full flex flex-col justify-center bg-[#FFFDF8] px-6">
      {/* 타이틀 */}
      <div className="w-full flex justify-center mt-4 mb-8">
        <h1 className="text-2xl font-bold text-[#F86516]">비밀번호 찾기</h1>
      </div>

      <div className="w-full flex flex-col space-y-6">
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
        </div>

        {/* 인증번호*/}
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
          {/* 인증번호 재발송 텍스트 */}
          <div className="flex justify-end px-4 pt-1">
            <button type="button" className="text-[#FF9639] text-xs font-semibold hover:underline cursor-pointer">
              인증번호 재발송
            </button>
          </div>
        </div>

        {/* 구분선 */}
        <div className="py-2">
          <div className="w-full border-t-2 border-[#FF9639]"></div>
        </div>

        {/* 새 비밀번호 */}
        <div className="flex flex-col space-y-2">
          <label className="text-[#FF8223] text-sm font-semibold ml-4">새 비밀번호</label>
          <input
            type="password"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            placeholder="비밀번호를 입력해주세요."
            className="w-full h-10 rounded-full border-[1.5px] border-[#FF8223] px-5 text-sm bg-transparent placeholder-[#FFBE85] focus:outline-none focus:ring-2 focus:ring-[#f87816]/30"
          />
        </div>

        {/* 새 비밀번호 확인*/}
        <div className="flex flex-col space-y-2">
          <label className="text-[#FF8223] text-sm font-semibold ml-4">새 비밀번호 확인</label>
          <input
            type="password"
            name="newPasswordConfirm"
            value={formData.newPasswordConfirm}
            onChange={handleChange}
            placeholder="비밀번호를 입력해주세요."
            className="w-full h-10 rounded-full border-[1.5px] border-[#FF8223] px-5 text-sm bg-transparent placeholder-[#FFBE85] focus:outline-none focus:ring-2 focus:ring-[#f87816]/30"
          />
        </div>
      </div>

      {/* 비밀번호 변경하기 버튼 */}
      <div className="mt-8">
        <p className="text-[#FF2339] text-xs font-medium mb-3 text-center">에러 메시지 영역</p>
        <Button onClick={handleSubmit}>비밀번호 변경하기</Button>
      </div>
    </PageTransition>
  );
}
