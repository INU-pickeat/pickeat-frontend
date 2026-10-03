import { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import PageTransition from "../components/PageTransition";
import LeftArrow from "../assets/arrow_left.svg";
import GalleryIcon from "../assets/icons/gallery.svg";
import Button from "../components/Button";

export default function Write() {
  const navigate = useNavigate();
  const location = useLocation();
  const editRecord = location.state?.record || null;

  const [reviewText, setReviewText] = useState(editRecord?.review || ""); // 수정 모드인지 판별하는 상태

  // 갤러리 접근 관련 상태
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setPreviewImage(imageUrl);
    }
  };

  // 기록 저장
  const handleSave = () => {
    if (!previewImage) return alert("사진을 업로드해주세요.");
    if (!reviewText.trim()) return alert("간단한 기록을 남겨주세요.");

    alert(editRecord ? "기록이 성공적으로 수정되었습니다!" : "기록이 저장되었습니다!");
    navigate(-1);
  };

  return (
    <PageTransition className="h-dvh w-full flex flex-col relative bg-[#FFFDF8] overflow-hidden">
      <div className="relative z-10 flex-1 overflow-y-auto scrollbar-hide">
        {/* 헤더 영역 */}
        <div className="pt-10 px-6 relative z-10">
          <button
            onClick={() => navigate("/home")}
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
              <h2 className="text-[#F86516] font-bold text-[20px] mb-1.5">
                {editRecord ? editRecord.restaurantName : "식당 이름"}
              </h2>
              <p className="text-[#434343] font-medium text-[12px]">{editRecord ? editRecord.tags : "카테고리 정보"}</p>
            </div>
            {/* 식당 썸네일 */}
            <div className="w-14 h-14 rounded-full overflow-hidden border-black/5 bg-gray-200 shrink-0">
              {editRecord && <img src={editRecord.image} className="w-full h-full object-cover" />}
            </div>
          </div>

          {/* 구분선 */}
          <hr className="border-t-[2.5px] border-[#FF9639] mt-5 mb-5" />

          <h3 className="text-[#F87816] font-semibold text-[15px] mb-4">오늘의 pick은 어땠나요?</h3>

          {/* 사진 업로드 영역 */}
          <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageChange} />

          <button
            onClick={handleImageClick}
            className="relative w-full h-60 bg-[#FFFDF8] rounded-[15px] py-20 flex flex-col items-center justify-center shadow-[0_2px_10px_rgba(0,0,0,0.03)] mb-6 active:scale-[0.98] transition-transform overflow-hidden"
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
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            className="w-full bg-[#FFECCD] rounded-[20px] p-5 text-[14px] text-[#333333] placeholder:text-[#757575] resize-none h-32 focus:outline-none focus:ring-1 focus:ring-[#F87816] shadow-inner"
            placeholder="간단한 기록을 남겨주세요."
          ></textarea>

          {/* 버튼 영역 */}
          <div className="mt-auto pt-8">
            <Button onClick={() => alert("구현 예정입니다.")} className="w-full shadow-none">
              {editRecord ? "수정하기" : "기록하기"}
            </Button>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
