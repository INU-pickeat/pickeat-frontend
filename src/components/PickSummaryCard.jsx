import { Link } from "react-router-dom";

/** 식당별 Pick 요약 */
export default function PickSummaryCard({ pick, to }) {
  const className =
    "w-full min-h-[82px] bg-[#FFECCD] rounded-2xl flex flex-col justify-center gap-2 px-5 py-3 shadow-sm";
  const content = (
    <>
      <h4 className="text-[16px] font-bold text-[#F86516] truncate">{pick.restaurantName}</h4>
      <div className="flex flex-wrap gap-x-3 text-[13px] text-[#434343] font-medium">
        <span>
          {new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", month: "long", day: "numeric" }).format(
            new Date(pick.latestPickedAt),
          )}
        </span>
        <span>{pick.pickCount}번의 pick</span>
      </div>
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
