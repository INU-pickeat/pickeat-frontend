/** 회원가입 입력 검증 */
export function validateSignup({ email, password, nickname, passwordConfirm }) {
  const errors = {};
  if (!/^[가-힣A-Za-z0-9]{1,10}$/.test(nickname.trim()))
    errors.nickname = "닉네임은 한글/영문/숫자로 1-5자 입력해주세요.";

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errors.email = "올바른 이메일 주소를 입력해주세요.";

  if (password.length < 8 || password.length > 64) errors.password = "비밀번호는 8-64자로 입력해주세요.";

  if (!passwordConfirm || password !== passwordConfirm) errors.passwordConfirm = "비밀번호가 일치하지 않아요.";

  return errors;
}
