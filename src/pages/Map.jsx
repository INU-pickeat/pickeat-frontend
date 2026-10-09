import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleMap, useJsApiLoader, OverlayViewF } from "@react-google-maps/api";
import PageTransition from "../components/PageTransition";
import LeftArrow from "../assets/arrow_left.svg";
import TabMenu from "../components/TabMenu";
import BottomNav from "../components/BottomNav";
import ReviewModal from "../components/ReviewModal";
import usePickMap from "../hooks/usePickMap";
import { googleMapsLoaderOptions } from "../config/googleMaps";

const containerStyle = {
  width: "100%",
  height: "100%",
};

// 초기 중심 좌표
const center = {
  lat: 37.521,
  lng: 127.023,
};

const companionNames = {
  DATE: "데이트",
  FAMILY: "가족과 함께",
  CHILDREN: "아이와 함께",
  SOLO: "혼밥",
  GROUP: "단체·회식",
  DOG: "반려견과 함께",
};

export default function Map() {
  const navigate = useNavigate();

  const { isLoaded, loadError } = useJsApiLoader(googleMapsLoaderOptions);

  const [selectedReview, setSelectedReview] = useState(null);
  const [map, setMap] = useState(null);
  const { picks, isLoading, error, needsLogin, retry } = usePickMap();

  /** 내 Pick 위치에 지도 맞추기 */
  useEffect(() => {
    if (!map || !picks.length) return;
    if (picks.length === 1) {
      map.setCenter({ lat: picks[0].latitude, lng: picks[0].longitude });
      map.setZoom(15);
    } else {
      const bounds = new window.google.maps.LatLngBounds();
      picks.forEach((pick) => bounds.extend({ lat: pick.latitude, lng: pick.longitude }));
      map.fitBounds(bounds, 60);
      if (map.getZoom() > 16) map.setZoom(16);
    }
  }, [map, picks]);

  return (
    <>
      <PageTransition className="h-dvh w-full flex flex-col relative bg-[#FFFDF8] overflow-hidden pb-24">
        {/* 헤더 영역 */}
        <div className="pt-10 px-6 relative z-10">
          <button
            onClick={() => navigate("/calendar")}
            className="mb-6 p-2 -ml-2 active:scale-90 transition-transform cursor-pointer"
          >
            <img src={LeftArrow} className="w-6 h-6" />
          </button>

          <TabMenu />
        </div>

        <div className="px-6 pb-3 text-sm text-[#777777]">
          {isLoading ? (
            <p role="status">Pick을 불러오는 중이에요.</p>
          ) : error ? (
            <div role="alert">
              <p>{error}</p>
              {needsLogin ? (
                <Link to="/login" className="text-[#F86516] underline">
                  로그인하기
                </Link>
              ) : (
                <button type="button" onClick={retry} className="text-[#F86516] underline cursor-pointer">
                  다시 시도
                </button>
              )}
            </div>
          ) : picks.length === 0 ? (
            <p className="text-center">첫 기록을 작성해보세요.</p>
          ) : null}
        </div>
        {/* 구글 맵 영역 */}
        <div className="flex-1 relative z-0">
          <div className="absolute inset-0">
            {isLoaded ? (
              <GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                zoom={15}
                onLoad={setMap}
                options={{
                  disableDefaultUI: true,
                  clickableIcons: false,
                  zoomControl: false,
                }}
              >
                {/* 커스텀 마커 그리기 */}
                {picks.map((loc) => (
                  <OverlayViewF
                    key={loc.pickId}
                    position={{ lat: loc.latitude, lng: loc.longitude }}
                    mapPaneName="overlayMouseTarget"
                  >
                    <button
                      type="button"
                      aria-label={`${loc.restaurantName} 리뷰 보기`}
                      className="relative -translate-x-1/2 -translate-y-1/2 cursor-pointer active:scale-90 transition-transform"
                      onClick={() =>
                        setSelectedReview({
                          ...loc,
                          tags: companionNames[loc.companionType] || loc.companionType || "",
                        })
                      }
                    >
                      {/* 마커 스타일 */}
                      <div className="w-[50px] h-[50px] rounded-full overflow-hidden border-[3.5px] border-[#FF6C2A] shadow-[0_4px_10px_rgba(248,101,22,0.4)]">
                        <span className="flex h-full w-full items-center justify-center bg-[#FFECCD] text-[#F86516] text-[11px] font-bold px-1">
                          pick
                        </span>
                      </div>
                    </button>
                  </OverlayViewF>
                ))}
              </GoogleMap>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-center text-[#F86516] font-bold text-sm">
                  {loadError ? "지도를 불러오지 못했어요. 페이지를 새로고침해주세요." : "지도를 불러오는 중..."}
                </span>
              </div>
            )}
          </div>
        </div>
      </PageTransition>

      {/* 네비게이션 바 */}
      <BottomNav />
      {selectedReview && (
        <ReviewModal review={selectedReview} showAuthor={false} onClose={() => setSelectedReview(null)} />
      )}
    </>
  );
}
