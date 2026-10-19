import DefaultThumbnail from "../../assets/thumbnail_default.png";

/** 식당 사진이 없거나 로드 실패 시 기본 이미지 표시 */
export default function RestaurantImage({ src, alt = "", ...props }) {
  return (
    <img
      {...props}
      src={src || DefaultThumbnail}
      alt={alt}
      onError={(event) => {
        if (event.currentTarget.getAttribute("src") !== DefaultThumbnail) event.currentTarget.src = DefaultThumbnail;
      }}
    />
  );
}
