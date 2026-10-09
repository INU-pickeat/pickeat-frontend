import { Link } from "react-router-dom";
import { foodNames } from "../api/recommendations";

/** 식당별 Pick 요약 */
export default function PickSummaryCard({ pick, to }) {
  const className = "w-full min-h-[80px] bg-[#FFECCD] rounded-[24px] flex overflow-hidden shadow-sm";
  const image = pick.representativeImageUrl
    ? new URL(pick.representativeImageUrl, "https://api.pickeat.kr").href
    : null;
  const category = foodNames[pick.foodCategory] || pick.foodCategory;
  const content = (
    <>
      {/* 식당 카드 영역 */}
      <div className="min-w-0 flex-1 flex flex-col justify-center gap-2 px-6 py-4">
        <h4 className="text-[16px] font-bold text-[#F86516] truncate">{pick.restaurantName}</h4>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-[#434343] font-medium">
          {category && <span>{category}</span>}
          <span>
            {new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", month: "long", day: "numeric" }).format(
              new Date(pick.latestPickedAt),
            )}
          </span>
          <span>{pick.pickCount}번째 방문</span>
        </div>
      </div>

      {/* 대표 사진 영역 */}
      {image && (
        <div className="relative w-[24%] min-w-20 max-w-[108px] shrink-0 bg-[#FFE0B2]">
          <img
            key={image}
            src={image}
            alt={pick.restaurantName}
            className="absolute inset-0 h-full w-full object-cover"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
        </div>
      )}
    </>
  );
  return to ? (
    <Link to={to} className={className}>
      {content}
    </Link>
  ) : (
    <div className={className}>{content}</div>
  );
}
