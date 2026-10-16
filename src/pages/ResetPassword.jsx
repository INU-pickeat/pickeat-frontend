import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageTransition from "../components/common/PageTransition";
import Button from "../components/common/Button";
import { sendPasswordResetVerification, confirmEmailVerification, resetPassword } from "../api/auth";
import { getApiErrorMessage } from "../utils/apiError";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [sentEmail, setSentEmail] = useState("");
  const [verifiedUntil, setVerifiedUntil] = useState(0);
  const [action, setAction] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const requestRef = useRef(null);
  const isBusy = !!action;
  const isVerified = verifiedUntil > 0;

  useEffect(() => () => requestRef.current?.abort(), []);

  const [formData, setFormData] = useState({
    email: "",
    code: "",
    newPassword: "",
    newPasswordConfirm: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value, ...(name === "email" ? { code: "" } : {}) }));
    setErrorMessage("");
    if (name === "email") {
      setSentEmail("");
      setVerifiedUntil(0);
    }
  };

  /** 요청 중 중복 제출 방지 */
  const runRequest = async (type, task) => {
    if (requestRef.current) return;
    const controller = new AbortController();
    requestRef.current = controller;
    setAction(type);
    setErrorMessage("");
    try {
      await task(controller.signal);
    } catch (error) {
      if (!controller.signal.aborted) {
        setErrorMessage(getApiErrorMessage(error, "요청을 처리하지 못했어요. 다시 시도해주세요."));
        if ([403, 410].includes(error.response?.status)) setVerifiedUntil(0);
      }
    } finally {
      if (!controller.signal.aborted) setAction("");
      requestRef.current = null;
    }
  };

  /** 재설정용 인증번호 발송 */
  const handleSend = () => {
    const email = formData.email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMessage("올바른 이메일 주소를 입력해주세요.");
      return;
    }
    return runRequest("send", async (signal) => {
      await sendPasswordResetVerification(email, signal);
      if (signal.aborted) return;
      setSentEmail(email);
      setVerifiedUntil(0);
      setFormData((prev) => ({ ...prev, code: "" }));
    });
  };

  /** 인증번호 확인 */
  const handleConfirm = () => {
    if (!/^\d{6}$/.test(formData.code)) {
      setErrorMessage("인증번호는 숫자 6자리로 입력해주세요.");
      return;
    }
    return runRequest("confirm", async (signal) => {
      await confirmEmailVerification({ email: sentEmail, code: formData.code }, signal);
      if (!signal.aborted) setVerifiedUntil(Date.now() + 30 * 60 * 1000);
    });
  };

  /** 새 비밀번호 저장 */
  const handleSubmit = () => {
    if (!sentEmail || formData.email.trim().toLowerCase() !== sentEmail || Date.now() >= verifiedUntil) {
      setVerifiedUntil(0);
      setErrorMessage("이메일 인증을 완료한 후 비밀번호를 변경해주세요.");
      return;
    }
    if (formData.newPassword.length < 8 || formData.newPassword.length > 64) {
      setErrorMessage("비밀번호는 8~64자로 입력해주세요.");
      return;
    }
    if (formData.newPassword !== formData.newPasswordConfirm) {
      setErrorMessage("새 비밀번호 확인이 일치하지 않아요.");
      return;
    }
    return runRequest("reset", async (signal) => {
      await resetPassword({ email: sentEmail, newPassword: formData.newPassword }, signal);
      if (signal.aborted) return;
      alert("비밀번호가 성공적으로 변경되었습니다.");
      navigate("/login", { replace: true });
    });
  };

  return (
    <PageTransition className="min-h-dvh w-full flex flex-col bg-[#FFFDF8] px-[25px] pt-[113px] pb-[62px]">
      {/* 타이틀 */}
      <div className="w-full flex justify-center mb-[71px]">
        <h1 className="text-2xl leading-[50px] font-bold text-[#F86516]">비밀번호 찾기</h1>
      </div>

      <div className="w-full flex flex-col gap-[10px]">
        {/* 이메일 & 인증하기 버튼 */}
        <div className="flex flex-col gap-[7px]">
          <label htmlFor="reset-email" className="text-[#FF8223] text-[14px] leading-[30px] font-medium ml-5">
            이메일
          </label>
          <div className="flex gap-3">
            <input
              type="email"
              name="email"
              id="reset-email"
              autoComplete="email"
              disabled={isBusy}
              value={formData.email}
              onChange={handleChange}
              placeholder="이메일을 입력해주세요."
              className="flex-1 min-w-0 h-[35px] rounded-full border-[1.5px] border-[#FF8223] px-5 text-[12px] bg-transparent placeholder-[#FFBE85] focus:outline-none focus:ring-2 focus:ring-[#f87816]/30"
            />
            <button
              type="button"
              disabled={isBusy || isVerified}
              onClick={sentEmail ? handleConfirm : handleSend}
              className="w-20 shrink-0 h-[35px] bg-[#FF9639] text-white text-[12px] font-semibold rounded-full active:scale-95 transition-transform cursor-pointer"
            >
              {action === "send"
                ? "발송 중…"
                : action === "confirm"
                  ? "확인 중…"
                  : isVerified
                    ? "인증 완료"
                    : sentEmail
                      ? "인증 확인"
                      : "인증하기"}
            </button>
          </div>
        </div>

        {/* 인증번호*/}
        <div className="flex flex-col gap-[7px]">
          <label htmlFor="reset-code" className="text-[#FF8223] text-[14px] leading-[30px] font-medium ml-5">
            인증번호
          </label>
          <input
            type="text"
            name="code"
            id="reset-code"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            disabled={isBusy || !sentEmail || isVerified}
            value={formData.code}
            onChange={handleChange}
            placeholder="인증번호를 입력해주세요."
            className="w-full h-[35px] rounded-full border-[1.5px] border-[#FF8223] px-5 text-[12px] bg-transparent placeholder-[#FFBE85] focus:outline-none focus:ring-2 focus:ring-[#f87816]/30"
          />
          {/* 인증번호 재발송 텍스트 */}
          <div className="flex justify-end px-4 pt-1">
            <button
              type="button"
              onClick={handleSend}
              disabled={isBusy || !sentEmail}
              className="text-[#FF9639] text-xs font-semibold hover:underline cursor-pointer"
            >
              인증번호 재발송
            </button>
          </div>
        </div>

        {/* 구분선 */}
        <div className="mt-[14px] mb-3 py-2">
          <div className="w-full border-t-2 border-[#FF9639]"></div>
        </div>

        {/* 인증 완료 후 새 비밀번호 입력 */}
        {isVerified && (
          <>
            <div className="flex flex-col gap-[7px]">
              <label htmlFor="reset-password" className="text-[#FF8223] text-[14px] leading-[30px] font-medium ml-5">
                새 비밀번호
              </label>
              <input
                type="password"
                name="newPassword"
                id="reset-password"
                autoComplete="new-password"
                disabled={isBusy}
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="비밀번호를 입력해주세요."
                className="w-full h-[35px] rounded-full border-[1.5px] border-[#FF8223] px-5 text-[12px] bg-transparent placeholder-[#FFBE85] focus:outline-none focus:ring-2 focus:ring-[#f87816]/30"
              />
            </div>

            {/* 새 비밀번호 확인*/}
            <div className="flex flex-col gap-[7px]">
              <label
                htmlFor="reset-password-confirm"
                className="text-[#FF8223] text-[14px] leading-[30px] font-medium ml-5"
              >
                새 비밀번호 확인
              </label>
              <input
                type="password"
                name="newPasswordConfirm"
                id="reset-password-confirm"
                autoComplete="new-password"
                disabled={isBusy}
                value={formData.newPasswordConfirm}
                onChange={handleChange}
                placeholder="비밀번호를 입력해주세요."
                className="w-full h-[35px] rounded-full border-[1.5px] border-[#FF8223] px-5 text-[12px] bg-transparent placeholder-[#FFBE85] focus:outline-none focus:ring-2 focus:ring-[#f87816]/30"
              />
            </div>
          </>
        )}
      </div>

      {/* 비밀번호 변경하기 버튼 */}
      <div className="mt-auto pt-10">
        {errorMessage && (
          <p role="alert" className="mb-3 text-center text-xs text-[#FF5C5C]">
            {errorMessage}
          </p>
        )}
        <Button onClick={handleSubmit} disabled={isBusy} className="h-[38px] shadow-none">
          {action === "reset" ? "변경 중…" : "비밀번호 변경하기"}
        </Button>
      </div>
    </PageTransition>
  );
}
