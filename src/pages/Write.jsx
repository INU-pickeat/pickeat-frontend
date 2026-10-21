import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import PageTransition from "../components/common/PageTransition";
import LeftArrow from "../assets/icons/arrow_left.svg";
import GalleryIcon from "../assets/icons/gallery.svg";
import Button from "../components/common/Button";
import ReviewEdit from "../components/review/ReviewEdit";
import { createReview } from "../api/reviews";
import { uploadReviewImage } from "../api/reviewImages";
import { getApiErrorMessage } from "../utils/apiError";
import { reviewTags } from "../utils/reviewDisplay";
const situationCodes = { date: "DATE", family: "FAMILY", kids: "CHILDREN", solo: "SOLO", group: "GROUP", pet: "DOG" };
const reviewImageTypes = ["image/jpeg", "image/png", "image/webp"];

export default function Write() {
  const location = useLocation();
  const [params] = useSearchParams();
  const reviewId = params.get("reviewId") || location.state?.record?.reviewId;
  return reviewId ? <ReviewEdit key={reviewId} reviewId={reviewId} /> : <WriteDraft />;
}

function WriteDraft() {
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const pickId = Number(params.get("pickId") || location.state?.pick?.pickId);
  const restaurant = location.state?.selectedRestaurant;
  const foodCategory = restaurant?.foodCategory || location.state?.pick?.foodCategory;
  const companionType = situationCodes[location.state?.situation] || location.state?.pick?.companionType;
  const [shareToFeed, setShareToFeed] = useState(true);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const inFlight = useRef(false);
  const uploadedImages = useRef(new Map());
  const [photos, setPhotos] = useState([]);
  const previewUrls = useRef(new Set());

  const [reviewText, setReviewText] = useState("");

  // 갤러리 접근 관련 상태
  const fileInputRef = useRef(null);
  const hasPick = Number.isSafeInteger(pickId) && pickId > 0;

  useEffect(() => {
    const urls = previewUrls.current;
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  /** 사진 선택창 열기 */
  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  /** 사진 추가: 최대 5장 */
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length) return;
    if (files.some((file) => !reviewImageTypes.includes(file.type))) {
      setError("JPEG·PNG·WebP 사진만 첨부할 수 있어요.");
      return;
    }
    if (photos.length + files.length > 5) {
      setError("사진은 최대 5장까지 첨부할 수 있어요.");
      return;
    }
    setError("");
    setPhotos((current) => [
      ...current,
      ...files.map((file) => {
        const preview = URL.createObjectURL(file);
        previewUrls.current.add(preview);
        return { file, preview };
      }),
    ]);
  };

  /** 선택한 사진 제거 */
  function removePhoto(photo) {
    URL.revokeObjectURL(photo.preview);
    previewUrls.current.delete(photo.preview);
    uploadedImages.current.delete(photo.file);
    setPhotos((current) => current.filter((item) => item !== photo));
  }

  /** 기록 저장 */
  async function handleSave() {
    if (inFlight.current || !hasPick) return;
    if (!photos.length) {
      setError("사진을 1장 이상 첨부해 주세요.");
      return;
    }
    if (!reviewText.trim() || reviewText.trim().length > 500) {
      setError("기록 내용을 1~500자로 입력해주세요.");
      return;
    }
    if (!foodCategory || !companionType) {
      setError("선택한 Pick의 정보를 확인할 수 없어요. 선택 완료 화면에서 다시 들어와주세요.");
      return;
    }
    inFlight.current = true;
    setIsSaving(true);
    setError("");
    try {
      const imageUrls = [];
      for (const { file } of photos) {
        if (!uploadedImages.current.has(file)) uploadedImages.current.set(file, await uploadReviewImage(file));
        imageUrls.push(uploadedImages.current.get(file));
      }
      await createReview({
        pickId,
        content: reviewText.trim(),
        foodCategory,
        companionType,
        visibility: shareToFeed ? "PUBLIC" : "PRIVATE",
        imageUrls,
      });
      navigate("/history", { replace: true });
    } catch (error) {
      setError(getApiErrorMessage(error, "기록을 저장하지 못했어요."));
    } finally {
      inFlight.current = false;
      setIsSaving(false);
    }
  }

  return (
    <PageTransition className="h-dvh w-full flex flex-col relative bg-[#FFFDF8] overflow-hidden">
      <div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-hidden">
        {/* 헤더 영역 */}
        <div className="pt-6 px-6 relative z-10 shrink-0">
          <button
            onClick={() => navigate("/home")}
            className="mb-4 p-2 -ml-2 active:scale-90 transition-transform cursor-pointer"
          >
            <img src={LeftArrow} alt="뒤로가기" className="w-6 h-6" />
          </button>
        </div>

        {/* 기록 작성 영역 */}
        <div className="min-h-0 flex-1 bg-[#FDF5E9] rounded-t-[30px] p-7 pb-[max(16px,env(safe-area-inset-bottom))] flex flex-col">
          {/* 식당 정보 */}
          <div className="flex shrink-0 justify-between items-center gap-3">
            <div className="min-w-0">
              <h2 className="text-[#F86516] font-bold text-[20px] mb-1.5 truncate">
                {restaurant?.name || "기록 작성"}
              </h2>
              <p className="text-[#434343] font-medium text-[12px]">{reviewTags({ companionType, foodCategory })}</p>
            </div>
            {/* 식당 썸네일 */}
            <div className="w-14 h-14 rounded-full overflow-hidden border-black/5 bg-gray-200 shrink-0">
              {restaurant?.image && (
                <img src={restaurant.image} alt="식당 사진" className="w-full h-full object-cover" />
              )}
            </div>
          </div>

          {/* 구분선 */}
          <hr className="shrink-0 border-t-[2.5px] border-[#FF9639] my-4" />

          <h3 className="shrink-0 text-[#F87816] font-semibold text-[15px] mb-3">오늘의 pick은 어땠나요?</h3>

          {/* 사진 업로드 영역 */}
          <input
            type="file"
            accept={reviewImageTypes.join(",")}
            multiple
            aria-label="기록 사진 추가"
            disabled={isSaving}
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageChange}
          />

          {photos.length ? (
            <div className="w-full min-h-0 flex-1 max-h-50 mb-6 flex items-center gap-3 overflow-x-auto">
              {photos.map((photo, index) => (
                <div key={photo.preview} className="relative h-28 w-28 shrink-0 overflow-hidden rounded-[15px]">
                  <img src={photo.preview} alt={`첨부 사진 ${index + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={() => removePhoto(photo)}
                    aria-label={`사진 ${index + 1} 삭제`}
                    className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full text-white"
                  >
                    ×
                  </button>
                </div>
              ))}
              {photos.length < 5 && (
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={handleImageClick}
                  aria-label="사진 더 추가"
                  className="h-28 w-28 shrink-0 rounded-[15px] bg-[#FFFDF8] flex items-center justify-center"
                >
                  <img src={GalleryIcon} alt="" className="w-10 h-10" />
                </button>
              )}
            </div>
          ) : (
            <button
              disabled={isSaving}
              onClick={handleImageClick}
              className="relative w-full min-h-0 flex-1 max-h-50 bg-[#FFFDF8] rounded-[15px] flex flex-col items-center justify-center shadow-[0_2px_10px_rgba(0,0,0,0.03)] mb-6 active:scale-[0.98] transition-transform overflow-hidden"
            >
              <img src={GalleryIcon} alt="사진 업로드" className="w-14 h-14 mb-3" />
              <span className="text-[#757575] font-medium text-[12px]">사진은 5장까지 업로드 가능합니다.</span>
            </button>
          )}

          {/* 한줄평 입력 영역 */}
          <textarea
            aria-label="기록 내용"
            maxLength={500}
            disabled={isSaving}
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            className="w-full shrink-0 bg-[#FFECCD] rounded-[20px] p-4 text-[12px] text-[#333333] placeholder:text-[#757575] resize-none h-24 overflow-y-auto focus:outline-none focus:ring-1 focus:ring-[#F87816]"
            placeholder="간단한 기록을 남겨주세요. (최대 500자)"
          ></textarea>

          {/* 피드 공유 여부 */}
          <label className="mt-3 shrink-0 flex items-center justify-between gap-3 text-[13px] font-semibold text-[#F87816] cursor-pointer">
            나의 pick 기록을 피드에 공유할까요?
            <input
              type="checkbox"
              checked={shareToFeed}
              onChange={(event) => setShareToFeed(event.target.checked)}
              disabled={isSaving}
              className="peer sr-only"
            />
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FFECCD] peer-focus-visible:ring-2 peer-focus-visible:ring-[#F87816]">
              {shareToFeed && (
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                  <path
                    d="m5 12 4 4 10-10"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </span>
          </label>

          {/* 버튼 영역 */}
          <div className="mt-auto shrink-0">
            {(!hasPick || error) && (
              <div className="mb-3 flex items-center justify-center text-center text-sm text-[#777777]">
                <p role="alert">{error || "기록을 작성할 Pick을 먼저 선택해주세요."}</p>
              </div>
            )}
            <Button
              onClick={handleSave}
              disabled={isSaving || !hasPick || !reviewText.trim()}
              className="w-full shadow-none disabled:opacity-50"
            >
              {isSaving ? "저장 중..." : "기록하기"}
            </Button>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
