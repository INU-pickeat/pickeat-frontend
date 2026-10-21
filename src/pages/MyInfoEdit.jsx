import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageTransition from "../components/common/PageTransition";
import Button from "../components/common/Button";
import useMyInfo from "../hooks/useMyInfo";
import { updateMyInfo, uploadProfileImage } from "../api/member";
import { getApiErrorMessage } from "../utils/apiError";
import DefaultProfile from "../assets/profile_default.png";
import ProfileEdit from "../assets/icons/profile_edit.svg";
import BackArrow from "../assets/icons/arrow_left.svg";

/** 내 정보 수정 화면 */
export default function MyInfoEdit() {
  const navigate = useNavigate();
  const { member, isLoading, error, needsLogin, retry } = useMyInfo();

  return (
    <PageTransition className="min-h-dvh w-full bg-[#FFFDF8] px-[26px] pt-[52px] pb-[68px] flex flex-col">
      <header>
        <button
          type="button"
          onClick={() => navigate("/mypage")}
          aria-label="마이페이지로 돌아가기"
          className="block cursor-pointer"
        >
          <img src={BackArrow} alt="" className="h-6 w-6" />
        </button>
        <h1 className="mt-6 pl-[3px] text-[22px] leading-[40px] font-bold text-[#F87816]">내 정보 수정</h1>
      </header>

      {isLoading && (
        <p role="status" className="exception-glow mt-6">
          내 정보를 불러오는 중이에요.
        </p>
      )}
      {error && (
        <div role="alert" className="exception-glow mt-6">
          <p>{error}</p>
          {needsLogin ? (
            <Link to="/login" className="mt-3 text-[#F86516] underline">
              로그인하기
            </Link>
          ) : (
            <button type="button" onClick={retry} className="mt-3 text-[#F86516] underline cursor-pointer">
              다시 시도
            </button>
          )}
        </div>
      )}
      {member && <ProfileForm key={member.memberId} member={member} />}
    </PageTransition>
  );
}

/** 프로필 입력 및 사진 미리보기 */
function ProfileForm({ member }) {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState(member.nickname || "");
  const [bio, setBio] = useState(member.bio || "");
  const [photo, setPhoto] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const uploadedPhoto = useRef(null);
  const fileInput = useRef(null);
  const nameInput = useRef(null);
  const saveRequest = useRef(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => () => saveRequest.current?.abort(), []);

  useEffect(
    () => () => {
      if (photo) URL.revokeObjectURL(photo);
    },
    [photo],
  );

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("이미지 파일을 선택해주세요.");
      return;
    }
    setPhoto(URL.createObjectURL(file));
    setPhotoFile(file);
    uploadedPhoto.current = null;
  };

  /** 변경한 정보 저장 */
  const handleSave = async (event) => {
    event.preventDefault();
    if (saveRequest.current) return;
    const trimmedNickname = nickname.trim();
    if (!trimmedNickname || [...trimmedNickname].length > 10) {
      alert("이름은 1~10자로 입력해주세요.");
      nameInput.current.focus();
      return;
    }
    const changes = {};
    if (trimmedNickname !== member.nickname) changes.nickname = trimmedNickname;
    if (bio !== (member.bio || "")) changes.bio = bio;
    if (!Object.keys(changes).length && !photoFile) {
      navigate("/mypage");
      return;
    }
    const controller = new AbortController();
    saveRequest.current = controller;
    setIsSaving(true);
    try {
      if (photoFile) {
        uploadedPhoto.current ||= await uploadProfileImage(photoFile, controller.signal);
        changes.profileImageUrl = uploadedPhoto.current;
      }
      await updateMyInfo(changes, controller.signal);
      if (!controller.signal.aborted) {
        alert("내 정보가 변경되었어요.");
        navigate("/mypage", { replace: true });
      }
    } catch (error) {
      if (!controller.signal.aborted) alert(getApiErrorMessage(error, "내 정보를 저장하지 못했어요."));
    } finally {
      if (!controller.signal.aborted) setIsSaving(false);
      saveRequest.current = null;
    }
  };

  return (
    <form className="flex-1 flex flex-col" onSubmit={handleSave}>
      {/* 프로필 사진 */}
      <div className="relative mx-auto mt-[22px] h-[71px] w-[71px] shrink-0">
        <img
          key={photo || member.profileImageUrl || "default"}
          src={photo || member.profileImageUrl || DefaultProfile}
          alt="프로필 이미지"
          className="h-full w-full rounded-full object-cover bg-[#F86516]"
          onError={(event) => {
            if (event.currentTarget.getAttribute("src") !== DefaultProfile) event.currentTarget.src = DefaultProfile;
          }}
        />
        <button
          type="button"
          disabled={isSaving}
          onClick={() => fileInput.current.click()}
          aria-label="프로필 사진 변경"
          className="absolute left-[48px] top-[50px] cursor-pointer"
        >
          <img src={ProfileEdit} alt="" />
        </button>
        <input ref={fileInput} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
      </div>

      {/* 이름 및 자기소개 */}
      <div className="mt-[25px]">
        <label htmlFor="profile-name" className="block pl-[17px] text-[14px] font-medium leading-[45px] text-[#434343]">
          이름
        </label>
        <div className="relative">
          <input
            ref={nameInput}
            id="profile-name"
            autoComplete="nickname"
            disabled={isSaving}
            value={nickname}
            onChange={(event) => setNickname(event.target.value)}
            className="h-[35px] w-full rounded-full bg-[#FFECCD] pl-[17px] pr-10 text-[14px] text-[#434343] outline-none focus-visible:ring-2 focus-visible:ring-[#FF9639]"
          />
          <button
            type="button"
            disabled={isSaving}
            aria-label="이름 지우기"
            onClick={() => {
              setNickname("");
              nameInput.current.focus();
            }}
            className="absolute right-[7px] top-2 h-[19px] w-[19px] rounded-full bg-white text-center text-[10px] leading-[19px] font-semibold text-[#FDBA74] cursor-pointer"
          >
            X
          </button>
        </div>
        <label htmlFor="profile-bio" className="block pl-[17px] text-[14px] font-medium leading-[50px] text-[#434343]">
          자기 소개
        </label>
        <textarea
          id="profile-bio"
          disabled={isSaving}
          value={bio}
          onChange={(event) => setBio(event.target.value)}
          className="block h-[94px] w-full resize-none rounded-[20px] bg-[#FFECCD] px-[17px] py-3 text-[14px] leading-5 text-[#434343] outline-none focus-visible:ring-2 focus-visible:ring-[#FF9639]"
        />
      </div>

      <div className="mt-auto pt-10">
        <Button type="submit" disabled={isSaving} className="h-[38px] shadow-none">
          {isSaving ? "저장 중…" : "저장"}
        </Button>
      </div>
    </form>
  );
}
