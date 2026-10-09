import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getReview, updateReview } from "../api/reviews";
import { uploadReviewImage } from "../api/reviewImages";
import { getApiErrorMessage } from "../utils/apiError";
import { reviewTags, reviewImageUrl } from "../utils/reviewDisplay";
import GalleryIcon from "../assets/icons/gallery.svg";
import Button from "./Button";
import PageTransition from "./PageTransition";
import LeftArrow from "../assets/arrow_left.svg";

/** 수정할 후기 조회 */
export default function ReviewEdit({ reviewId }) {
  const navigate = useNavigate();
  const [review, setReview] = useState(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    getReview(reviewId, controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setReview(data);
      })
      .catch((error) => {
        if (!controller.signal.aborted) setError(getApiErrorMessage(error, "기록을 불러오지 못했어요."));
      });
    return () => controller.abort();
  }, [reviewId, attempt]);

  if (review) return <ReviewEditForm key={review.reviewId} review={review} />;

  return (
    <PageTransition className="h-dvh w-full overflow-y-auto bg-[#FFFDF8] px-6 pt-10 pb-10">
      {/* 뒤로가기 */}
      <button onClick={() => navigate(-1)} className="mb-6">
        <img src={LeftArrow} alt="뒤로가기" className="w-6 h-6" />
      </button>

      {/* 로딩·오류 안내 */}
      {!review && (
        <div className="min-h-[180px] flex flex-col items-center justify-center text-center text-sm text-[#777777]">
          <p role={error ? "alert" : "status"}>{error || "기록을 불러오는 중이에요."}</p>
          {error && (
            <button
              onClick={() => {
                setError("");
                setAttempt((value) => value + 1);
              }}
              className="mt-3 text-[#F86516] underline"
            >
              다시 시도
            </button>
          )}
        </div>
      )}
    </PageTransition>
  );
}

/** 후기 수정 폼 */
function ReviewEditForm({ review }) {
  const navigate = useNavigate();
  const [content, setContent] = useState(review.content);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const uploadedImage = useRef(null);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const inFlight = useRef(false);
  const hasChanges = content !== review.content || imageFile !== null;
  const fileInputRef = useRef(null);
  const displayImage = preview || reviewImageUrl(review.imageUrls?.[0]);
  const thumbnail = reviewImageUrl(review.restaurantImageUrl || review.representativeImageUrl || review.imageUrls?.[0]);

  useEffect(() => {
    if (!preview) return;
    return () => URL.revokeObjectURL(preview);
  }, [preview]);

  /** 사진 교체 */
  function handleImageChange(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
    uploadedImage.current = null;
    setError("");
  }

  /** 변경한 기록 저장 */
  async function handleSave() {
    if (inFlight.current || !hasChanges || !content.trim()) return;
    inFlight.current = true;
    setIsSaving(true);
    setError("");
    try {
      const changes = {};
      if (content !== review.content) changes.content = content.trim();
      if (imageFile) {
        if (!uploadedImage.current) uploadedImage.current = await uploadReviewImage(imageFile);
        changes.imageUrls = [uploadedImage.current];
      }
      await updateReview(review.reviewId, changes);
      navigate("/history", { replace: true });
    } catch (error) {
      setError(getApiErrorMessage(error, "기록을 수정하지 못했어요."));
    } finally {
      inFlight.current = false;
      setIsSaving(false);
    }
  }

  return (
    <PageTransition className="h-dvh w-full flex flex-col relative bg-[#FFFDF8] overflow-hidden">
      <div className="relative z-10 flex-1 overflow-y-auto scrollbar-hide">
        {/* 헤더 영역 */}
        <div className="pt-10 px-6 relative z-10">
          <button
            onClick={() => navigate(-1)}
            className="mb-6 p-2 -ml-2 active:scale-90 transition-transform cursor-pointer"
          >
            <img src={LeftArrow} alt="뒤로가기" className="w-6 h-6" />
          </button>
        </div>

        {/* 기록 작성 영역 */}
        <div className="flex-1 bg-[#FFF5E4] rounded-t-[30px] px-6 pt-8 pb-18 flex flex-col">
          {/* 식당 정보 */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-[#F86516] font-bold text-[20px] mb-1.5">{review.restaurantName}</h2>
              <p className="text-[#434343] font-medium text-[12px]">{reviewTags(review)}</p>
            </div>
            {/* 식당 썸네일 */}
            <div className="w-14 h-14 rounded-full overflow-hidden border-black/5 bg-gray-200 shrink-0">
              {thumbnail && <img src={thumbnail} alt="식당 사진" className="w-full h-full object-cover" />}
            </div>
          </div>

          {/* 구분선 */}
          <hr className="border-t-[2.5px] border-[#FF9639] mt-5 mb-5" />

          <h3 className="text-[#F87816] font-semibold text-[15px] mb-4">오늘의 pick은 어땠나요?</h3>

          {/* 사진 업로드 영역 */}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            disabled={isSaving}
            onChange={handleImageChange}
          />

          <button
            type="button"
            disabled={isSaving}
            onClick={() => fileInputRef.current?.click()}
            className="relative w-full h-60 bg-[#FFFDF8] rounded-[15px] py-20 flex flex-col items-center justify-center shadow-[0_2px_10px_rgba(0,0,0,0.03)] mb-6 active:scale-[0.98] transition-transform overflow-hidden"
          >
            {displayImage ? (
              <img src={displayImage} alt="후기 사진" className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <>
                <img src={GalleryIcon} alt="사진 업로드" className="w-14 h-14 mb-3" />
                <span className="text-[#757575] font-medium text-[12px]">사진을 업로드해주세요.</span>
              </>
            )}
          </button>

          {/* 한줄평 입력 영역 */}
          <textarea
            maxLength={1000}
            aria-label="후기 내용"
            disabled={isSaving}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full bg-[#FFECCD] rounded-[20px] p-5 text-[14px] text-[#333333] placeholder:text-[#757575] resize-none h-32 focus:outline-none focus:ring-1 focus:ring-[#F87816] shadow-inner"
            placeholder="간단한 기록을 남겨주세요."
          ></textarea>

          {/* 버튼 영역 */}
          <div className="mt-auto pt-8">
            {error && (
              <p role="alert" className="mb-3 text-center text-sm text-[#777777]">
                {error}
              </p>
            )}
            <Button
              onClick={handleSave}
              disabled={isSaving || !hasChanges || !content.trim()}
              className="w-full shadow-none disabled:opacity-50"
            >
              {isSaving ? "저장 중..." : "수정하기"}
            </Button>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
