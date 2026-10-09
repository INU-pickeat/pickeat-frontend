import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getReview, updateReview, deleteReview } from "../api/reviews";
import { uploadReviewImage } from "../api/reviewImages";
import { getApiErrorMessage } from "../utils/apiError";
import { foodNames } from "../api/recommendations";
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
        if (!controller.signal.aborted) setError(getApiErrorMessage(error, "후기를 불러오지 못했어요."));
      });
    return () => controller.abort();
  }, [reviewId, attempt]);

  return (
    <PageTransition className="h-dvh w-full overflow-y-auto bg-[#FFFDF8] px-6 pt-10 pb-10">
      {/* 뒤로가기 */}
      <button onClick={() => navigate(-1)} className="mb-6">
        <img src={LeftArrow} alt="뒤로가기" className="w-6 h-6" />
      </button>

      {/* 로딩·오류 안내 */}
      {!review && (
        <div className="min-h-[180px] flex flex-col items-center justify-center text-center text-sm text-[#777777]">
          <p role={error ? "alert" : "status"}>{error || "후기를 불러오는 중이에요."}</p>
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
      {review && <ReviewEditForm review={review} />}
    </PageTransition>
  );
}

/** 후기 수정 폼 */
function ReviewEditForm({ review }) {
  const navigate = useNavigate();
  const [content, setContent] = useState(review.content);
  const [visibility, setVisibility] = useState(review.visibility);
  const [removeImage, setRemoveImage] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const uploadedImage = useRef(null);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const isBusy = isSaving || isDeleting;
  const inFlight = useRef(false);
  const hasChanges =
    content !== review.content ||
    visibility !== review.visibility ||
    removeImage ||
    imageFile !== null;

  useEffect(() => {
    if (!preview) return;
    return () => URL.revokeObjectURL(preview);
  }, [preview]);

  /** 이미지 변경 */
  function handleImageChange(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setImageFile(file);
    uploadedImage.current = null;
    setRemoveImage(false);
    setError("");
  }

  /** 후기 삭제 */
  async function handleDelete() {
    if (inFlight.current) return;
    if (!window.confirm("후기를 삭제할까요? 삭제하면 다시 후기를 작성할 수 있는 상태로 돌아가요.")) return;
    inFlight.current = true;
    setIsDeleting(true);
    setError("");
    try {
      await deleteReview(review.reviewId);
      navigate("/history", { replace: true });
    } catch (error) {
      setError(getApiErrorMessage(error, "후기를 삭제하지 못했어요."));
    } finally {
      inFlight.current = false;
      setIsDeleting(false);
    }
  }

  /** 변경한 항목 저장 */
  async function handleSave(event) {
    event.preventDefault();
    if (inFlight.current || !hasChanges) return;
    if (!content.trim()) {
      setError("후기 내용을 입력해주세요.");
      return;
    }
    const changes = {};
    if (content !== review.content) changes.content = content.trim();
    if (visibility !== review.visibility) changes.visibility = visibility;
    if (removeImage) changes.imageUrls = [];
    inFlight.current = true;
    setIsSaving(true);
    setError("");
    try {
      if (imageFile) {
        // 수정 재시도 시 이미 업로드한 사진은 다시 올리지 않음
        if (!uploadedImage.current) uploadedImage.current = await uploadReviewImage(imageFile);
        changes.imageUrls = [uploadedImage.current];
      }
      await updateReview(review.reviewId, changes);
      navigate("/history", { replace: true });
    } catch (error) {
      setError(getApiErrorMessage(error, "후기를 수정하지 못했어요."));
    } finally {
      inFlight.current = false;
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="rounded-[30px] bg-[#FFF5E4] p-6 flex flex-col gap-5">
      {/* 식당 정보 */}
      <header>
        <h2 className="text-[20px] font-bold text-[#F86516]">{review.restaurantName}</h2>
        <p className="mt-2 text-sm text-[#434343]">{foodNames[review.foodCategory] || review.foodCategory}</p>
      </header>

      {/* 후기 작성 영역 */}
      <fieldset disabled={isBusy} className="flex flex-col gap-5">

        <label className="flex justify-between items-center text-[#434343]">
          공개 여부
          <select
            value={visibility}
            onChange={(event) => setVisibility(event.target.value)}
            className="rounded-lg bg-[#FFECCD] p-2"
          >
            <option value="PUBLIC">공개</option>
            <option value="PRIVATE">비공개</option>
          </select>
        </label>

        {/* 후기 사진 선택·교체·삭제 */}
        <label className="text-sm text-[#F86516]">
          사진 선택 (최대 1장)
          <input type="file" accept="image/*" onChange={handleImageChange} className="mt-2 block w-full text-sm" />
        </label>
        {(imageFile || review.imageUrls?.length > 0) && (
          <div>
            {!removeImage && (
              <img
                src={preview || review.imageUrls[0]}
                alt="후기 사진"
                className="w-full h-48 object-cover rounded-[15px]"
              />
            )}
            <button
              type="button"
              onClick={() => {
                if (imageFile) {
                  setImageFile(null);
                  setPreview(null);
                  uploadedImage.current = null;
                } else setRemoveImage((value) => !value);
              }}
              className="mt-3 text-sm text-[#F86516] underline"
            >
              {imageFile ? "새 사진 선택 취소" : removeImage ? "사진 삭제 취소" : "사진 삭제"}
            </button>
          </div>
        )}
        <textarea
          maxLength={1000}
          aria-label="후기 내용"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          className="h-32 resize-none rounded-[20px] bg-[#FFECCD] p-5 text-sm text-[#434343]"
        />
      </fieldset>

      {/* 오류 안내 & 저장 */}
      {error && (
        <div className="min-h-[180px] flex items-center justify-center text-center text-sm text-[#777777]">
          <p role="alert">{error}</p>
        </div>
      )}
      <Button
        type="submit"
        disabled={isBusy || !hasChanges || !content.trim()}
        className="shadow-none disabled:opacity-50"
      >
        {isSaving ? "저장 중..." : "수정하기"}
      </Button>

      {/* 후기 삭제 */}
      <button
        type="button"
        onClick={handleDelete}
        disabled={isBusy}
        className="text-sm text-[#F86516] underline disabled:opacity-50"
      >
        {isDeleting ? "삭제 중..." : "후기 삭제"}
      </button>
    </form>
  );
}
