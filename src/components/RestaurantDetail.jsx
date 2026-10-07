import PageTransition from "./PageTransition";
import LeftArrow from "../assets/arrow_left.svg";

export default function RestaurantDetail({ restaurant, onBack, actions, feedback }) {
  const hours = Array.isArray(restaurant.hours)
    ? restaurant.hours.filter((hour) => typeof hour?.time === "string" && hour.time.trim())
    : [];
  const phone = typeof restaurant.phone === "string" ? restaurant.phone.trim() : "";
  const openingHoursText = restaurant.openingHoursText?.trim();

  return (
    <PageTransition className="h-dvh w-full flex flex-col overflow-hidden bg-[#FFFDF8]">
      {/* 식당 이미지 & 뒤로가기 버튼 */}
      <div className="relative h-[34dvh] min-h-0 shrink-0 bg-[#9A7759]">
        {restaurant.image && (
          <img
            src={restaurant.image}
            alt={restaurant.name}
            className="h-full w-full object-cover"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
        )}
        <button
          type="button"
          onClick={onBack}
          aria-label="목록으로 돌아가기"
          className="absolute top-5 left-4 z-10 flex h-10 w-10 items-center justify-center cursor-pointer"
        >
          <img src={LeftArrow} alt="뒤로가기" className="w-6 h-6 brightness-0 invert" />
        </button>
      </div>

      {/* 내용 영역 */}
      <section className="relative -mt-5 flex min-h-0 flex-1 flex-col rounded-t-[28px] bg-[#FFFDF8]">
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain scrollbar-hide px-6 pt-8 pb-6">
          <header className="border-b-[2.5px] border-[#FFECCD] pb-4">
            <h1 className="text-[24px] font-extrabold text-[#F86516]">{restaurant.name}</h1>
            <p className="mt-2 text-[13px] font-semibold text-[#434343]">
              {[...(restaurant.features || []), restaurant.category].filter(Boolean).join(" / ")}
            </p>
          </header>

          {/* 한줄평 */}
          {restaurant.review && (
            <section className="mt-4 rounded-2xl border-2 border-[#FFB079] p-4">
              <h2 className="flex items-center gap-2 text-[16px] font-semibold text-[#F86516]">
                <img src="/assets/picker.svg" />
                picker들의 한줄평
              </h2>
              <p className="mt-2 font-medium text-[12px] leading-relaxed text-[#434343]">{restaurant.review}</p>
            </section>
          )}

          <section className="mt-5 px-2 text-[14px] text-[#434343]">
            <h2 className="text-[16px] font-bold text-[#F86516]">식당 정보</h2>
            {restaurant.address && (
              <>
                <h3 className="mt-6 font-semibold">위치</h3>
                <p className="mt-3 font-medium text-[12px] leading-relaxed">{restaurant.address}</p>
              </>
            )}

            {/* 영업시간 & 전화번호 */}
            {(hours.length > 0 || openingHoursText) && (
              <details className="group mt-6">
                <summary className="flex cursor-pointer list-none items-center justify-between py-2 font-semibold [&::-webkit-details-marker]:hidden">
                  영업시간
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 20 20"
                    fill="none"
                    className="h-4 w-4 transition-transform group-open:rotate-180"
                  >
                    <path
                      d="m5 7.5 5 5 5-5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </summary>
                <dl className="mt-3 space-y-4 pb-3 font-medium text-[12px]">
                  {openingHoursText && (
                    <div>
                      <dt className="sr-only">영업시간 안내</dt>
                      <dd className="whitespace-pre-wrap leading-relaxed">{openingHoursText}</dd>
                    </div>
                  )}
                  {hours.map(({ day, time }) => (
                    <div key={day} className="flex justify-between gap-4 leading-relaxed">
                      <dt className="shrink-0 font-semibold">{day}</dt>
                      <dd className="text-right">
                        <p className="mr-6">{time}</p>
                      </dd>
                    </div>
                  ))}
                </dl>
              </details>
            )}
            {phone && (
              <div className="mt-6 flex items-center">
                <h3 className="font-semibold mr-6">전화번호</h3>
                <p className="font-medium text-[12px] leading-relaxed">{phone}</p>
              </div>
            )}
          </section>
        </div>

        {/* 지도에 저장 & 공유하기 버튼 */}
        {actions && (
          <footer className="shrink-0 px-8 pt-3 pb-[max(24px,env(safe-area-inset-bottom))]">
            {feedback && (
              <p role="status" className="mb-3 text-center text-[12px] text-[#777777]">
                {feedback}
              </p>
            )}
            <div className="flex gap-3">{actions}</div>
          </footer>
        )}
      </section>
    </PageTransition>
  );
}
