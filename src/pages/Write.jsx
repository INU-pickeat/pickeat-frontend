import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import PageTransition from "../components/PageTransition";
import LeftArrow from "../assets/arrow_left.svg";
import GalleryIcon from "../assets/icons/gallery.svg";
import Button from "../components/Button";
import ReviewEdit from "../components/ReviewEdit";
import { createReview } from "../api/reviews";
import { uploadReviewImage } from "../api/reviewImages";
import { getApiErrorMessage } from "../utils/apiError";
import { reviewTags } from "../utils/reviewDisplay";
const situationCodes = { date: "DATE", family: "FAMILY", kids: "CHILDREN", solo: "SOLO", group: "GROUP", pet: "DOG" };

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
  const uploadedImage = useRef(null);
  const [imageFile, setImageFile] = useState(null);

  const [reviewText, setReviewText] = useState("");

  // 갤러리 접근 관련 상태
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);
  const hasPick = Number.isSafeInteger(pickId) && pickId > 0;

  useEffect(() => {
    if (!previewImage) return;
    return () => URL.revokeObjectURL(previewImage);
  }, [previewImage]);

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    e.target.value = "";
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setPreviewImage(imageUrl);
      setImageFile(file);
      uploadedImage.current = null;
    }
  };

  /** 후기 저장 */
  async function handleSave() {
    if (inFlight.current || !hasPick) return;
    if (!reviewText.trim() || reviewText.trim().length > 1000) {
      setError("기록 내용을 1~1000자로 입력해주세요.");
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
      if (imageFile && !uploadedImage.current) uploadedImage.current = await uploadReviewImage(imageFile);
      await createReview({
        pickId,
        content: reviewText.trim(),
        foodCategory,
        companionType,
        visibility: shareToFeed ? "PUBLIC" : "PRIVATE",
        ...(uploadedImage.current ? { imageUrls: [uploadedImage.current] } : {}),
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
        <div className="min-h-0 flex-1 bg-[#FFF5E4] rounded-t-[30px] p-7 pb-[max(16px,env(safe-area-inset-bottom))] flex flex-col">
          {/* 식당 정보 */}
          <div className="flex shrink-0 justify-between items-center gap-3">
            <div className="min-w-0">
              <h2 className="text-[#F86516] font-bold text-[20px] mb-1.5 truncate">
                {restaurant?.name || "후기 작성"}
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
          <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageChange} />

          <button
            disabled={isSaving}
            onClick={handleImageClick}
            className="relative w-full min-h-0 flex-1 max-h-60 bg-[#FFFDF8] rounded-[15px] flex flex-col items-center justify-center shadow-[0_2px_10px_rgba(0,0,0,0.03)] mb-6 active:scale-[0.98] transition-transform overflow-hidden"
          >
            {previewImage ? (
              <img src={previewImage} alt="업로드된 사진" className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <>
                <img src={GalleryIcon} alt="사진 업로드" className="w-14 h-14 mb-3" />
                <span className="text-[#757575] font-medium text-[12px]">사진을 업로드해주세요.</span>
              </>
            )}
          </button>

          {/* 한줄평 입력 영역 */}
          <textarea
            aria-label="후기 내용"
            maxLength={1000}
            disabled={isSaving}
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            className="w-full shrink-0 bg-[#FFECCD] rounded-[20px] p-4 text-[12px] text-[#333333] placeholder:text-[#757575] resize-none h-20 overflow-y-auto focus:outline-none focus:ring-1 focus:ring-[#F87816]"
            placeholder="간단한 기록을 남겨주세요."
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
