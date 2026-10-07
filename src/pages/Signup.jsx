import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageTransition from "../components/PageTransition";
import Button from "../components/Button";
import { signup, sendEmailVerification, confirmEmailVerification } from "../api/auth";
import { validateSignup } from "../utils/signupValidation";

export default function Signup() {
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const requestInFlight = useRef(false);
  const [verificationAction, setVerificationAction] = useState(null);
  const [codeExpiresAt, setCodeExpiresAt] = useState(0);
  const [resendAvailableAt, setResendAvailableAt] = useState(0);
  const [verifiedUntil, setVerifiedUntil] = useState(0);
  const [now, setNow] = useState(Date.now);
  const isVerified = verifiedUntil > now;
  const isBusy = isSubmitting || verificationAction !== null;
  const resendSeconds = Math.max(0, Math.ceil((resendAvailableAt - now) / 1000));
  const codeSeconds = Math.max(0, Math.ceil((codeExpiresAt - now) / 1000));

  // 인증 시간 갱신
  useEffect(() => {
    if (!codeExpiresAt && !verifiedUntil && !resendAvailableAt) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [codeExpiresAt, verifiedUntil, resendAvailableAt]);

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

  /** 입력 변경 */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value, ...(name === "email" ? { code: "" } : {}) }));
    if (name === "email") {
      setCodeExpiresAt(0);
      setResendAvailableAt(0);
      setVerifiedUntil(0);
      setErrors((prev) => ({ ...prev, email: "", code: "" }));
    }
    setErrorMessage("");
    // 사용자가 입력하기 시작하면 해당 항목의 에러 메시지를 지워줌
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  /** 인증번호 요청 */
  const handleSendCode = async () => {
    if (requestInFlight.current || Date.now() < resendAvailableAt || isVerified) return;
    const email = formData.email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrors((prev) => ({ ...prev, email: "올바른 이메일 주소를 입력해주세요." }));
      return;
    }
    requestInFlight.current = true;
    setVerificationAction("send");
    setErrorMessage("");
    setErrors((prev) => ({ ...prev, email: "", code: "" }));

    try {
      await sendEmailVerification(email);
      const sentAt = Date.now();
      setNow(sentAt);
      setCodeExpiresAt(sentAt + 10 * 60 * 1000);
      setResendAvailableAt(sentAt + 60 * 1000);
      setVerifiedUntil(0);
      setFormData((prev) => ({ ...prev, code: "" }));
    } catch (error) {
      const status = error.response?.status;
      if (status === 409) {
        setErrors((prev) => ({ ...prev, email: "이미 가입된 이메일이에요." }));
      } else if (status === 429) {
        const retryAt = Date.now();
        setNow(retryAt);
        setResendAvailableAt(retryAt + 60 * 1000);
        setErrors((prev) => ({ ...prev, email: "재발송은 1분 간격으로 가능해요. 잠시 후 다시 시도해주세요." }));
      } else {
        setErrors((prev) => ({
          ...prev,
          email:
            status === 503
              ? "메일을 보내지 못했어요. 잠시 후 다시 시도해주세요."
              : "인증번호를 요청하지 못했어요. 다시 시도해주세요.",
        }));
      }
    } finally {
      requestInFlight.current = false;
      setVerificationAction(null);
    }
  };

  /** 인증번호 확인 */
  const handleConfirmCode = async () => {
    if (requestInFlight.current || isVerified) return;
    if (!codeExpiresAt || Date.now() >= codeExpiresAt || verifiedUntil) {
      setErrors((prev) => ({ ...prev, code: "인증번호를 다시 발송해주세요." }));
      return;
    }
    if (!/^\d{6}$/.test(formData.code)) {
      setErrors((prev) => ({ ...prev, code: "인증번호는 숫자 6자리로 입력해주세요." }));
      return;
    }
    requestInFlight.current = true;
    setVerificationAction("confirm");
    setErrors((prev) => ({ ...prev, code: "" }));

    try {
      await confirmEmailVerification({ email: formData.email, code: formData.code });
      const confirmedAt = Date.now();
      setNow(confirmedAt);
      setVerifiedUntil(confirmedAt + 30 * 60 * 1000);
    } catch (error) {
      const status = error.response?.status;
      const code = error.response?.data?.code || error.response?.data?.errorCode;
      const message =
        status === 410
          ? "인증번호가 만료됐어요. 다시 발송해주세요."
          : status === 403
            ? "인증번호 발송 이력이 없어요. 다시 발송해주세요."
            : code === "GLOBAL_001"
              ? "인증번호는 숫자 6자리로 입력해주세요."
              : code === "MEMBER_006" || status === 400
                ? "번호가 틀렸거나 확인 횟수를 초과했어요. 번호를 확인하거나 재발송해주세요."
                : "인증번호를 확인하지 못했어요. 다시 시도해주세요.";
      if (status === 410 || status === 403) setCodeExpiresAt(0);
      setErrors((prev) => ({ ...prev, code: message }));
    } finally {
      requestInFlight.current = false;
      setVerificationAction(null);
    }
  };

  /** 회원가입 제출 */
  const handleSignup = async (event) => {
    event.preventDefault();
    if (requestInFlight.current) return;
    const newErrors = validateSignup(formData);
    if (Date.now() >= verifiedUntil) newErrors.code = "이메일 인증을 완료한 후 회원가입해주세요.";
    setErrors(newErrors);
    setErrorMessage("");
    if (Object.keys(newErrors).length) return;

    requestInFlight.current = true;
    setIsSubmitting(true);

    try {
      await signup({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        nickname: formData.nickname.trim(),
      });
      setVerifiedUntil(0);
      setCodeExpiresAt(0);
      setResendAvailableAt(0);
      alert("회원가입이 완료되었습니다!");
      navigate("/login", { replace: true });
    } catch (error) {
      if (error.response?.status === 403) {
        setVerifiedUntil(0);
        setCodeExpiresAt(0);
        setErrors({ code: "이메일 인증이 필요하거나 만료됐어요. 인증번호를 다시 발송해주세요." });
      } else if (error.response?.status === 409) {
        setErrors({ email: "이미 가입된 이메일이에요." });
      } else if (error.response?.status === 400) {
        setErrorMessage("입력한 정보를 확인해주세요.");
      } else if (error.message === "API_BASE_URL_MISSING") {
        setErrorMessage("서버 주소가 설정되지 않았어요.");
      } else if (error.code === "ECONNABORTED") {
        setErrorMessage("응답이 지연되고 있어요. 다시 시도해주세요.");
      } else {
        setErrorMessage("회원가입하지 못했어요. 잠시 후 다시 시도해주세요.");
      }
    } finally {
      requestInFlight.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <PageTransition className="flex-1 w-full flex flex-col justify-center bg-[#FFFDF8] px-6 pt-10 pb-20 overflow-y-auto scrollbar-hide">
      {/* 타이틀 */}
      <div className="w-full flex justify-center mt-4 mb-10">
        <h1 className="text-2xl font-bold text-[#F86516]">회원가입</h1>
      </div>

      <form onSubmit={handleSignup} noValidate aria-busy={isBusy}>
        <fieldset disabled={isBusy} className="w-full flex flex-col space-y-6">
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
                onClick={handleSendCode}
                disabled={isBusy || resendSeconds > 0 || isVerified}
                className="w-18 shrink-0 h-10 bg-[#FF9639] text-white text-[12px] font-semibold rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {verificationAction === "send"
                  ? "발송 중…"
                  : isVerified
                    ? "인증 완료"
                    : resendSeconds > 0
                      ? `${resendSeconds}초`
                      : "인증하기"}
              </button>
            </div>
            {errors.email && (
              <p role="alert" className="text-[#FF5C5C] text-xs font-semibold ml-4">
                {errors.email}
              </p>
            )}
          </div>

          {/* 인증번호 */}
          <div className="flex flex-col space-y-2">
            <label className="text-[#FF8223] text-sm font-semibold ml-4">인증번호</label>
            <div className="flex space-x-2">
              <input
                type="text"
                name="code"
                disabled={isBusy || !codeExpiresAt || codeSeconds === 0 || isVerified}
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={formData.code}
                onChange={handleChange}
                placeholder="인증번호를 입력해주세요."
                className="flex-1 min-w-0 h-10 rounded-full border-[1.5px] border-[#FF8223] px-5 text-sm bg-transparent placeholder-[#FFBE85] focus:outline-none focus:ring-2 focus:ring-[#f87816]/30"
              />
              <button
                type="button"
                onClick={handleConfirmCode}
                disabled={isBusy || !codeExpiresAt || codeSeconds === 0 || isVerified || !!verifiedUntil}
                className="w-18 shrink-0 h-10 bg-[#FF9639] text-white text-[12px] font-semibold rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {verificationAction === "confirm" ? "확인 중…" : isVerified ? "인증 완료" : "확인"}
              </button>
            </div>
            <div className="flex justify-between items-start gap-3 px-4 pt-1">
              <span className="min-w-0 flex-1 text-[#FF5C5C] text-xs font-semibold leading-relaxed">{errors.code}</span>
              <button
                type="button"
                onClick={handleSendCode}
                disabled={isBusy || resendSeconds > 0 || isVerified}
                className="shrink-0 whitespace-nowrap text-[#FF8223] text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resendSeconds > 0 ? `${resendSeconds}초 후 재발송 가능` : "인증번호 재발송"}
              </button>
            </div>
            {(verifiedUntil > 0 && !isVerified) || (!verifiedUntil && codeExpiresAt > 0 && codeSeconds === 0) ? (
              <p role="status" className="text-[#FF8223] text-xs leading-relaxed px-4">
                {verifiedUntil
                  ? "인증이 만료됐어요. 인증번호를 다시 발송해주세요."
                  : "인증번호가 만료됐어요. 다시 발송해주세요."}
              </p>
            ) : null}
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
        </fieldset>

        <div className="mt-12 mb-8">
          {errorMessage && (
            <p role="alert" className="text-[#FF5C5C] text-xs font-medium mb-3 text-center">
              {errorMessage}
            </p>
          )}
          <Button type="submit" disabled={isBusy || !isVerified} className="shadow-none disabled:opacity-50">
            {isSubmitting ? "가입 중…" : "회원가입"}
          </Button>
        </div>
      </form>
    </PageTransition>
  );
}
