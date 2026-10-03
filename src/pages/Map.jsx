import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleMap, useJsApiLoader, OverlayViewF } from "@react-google-maps/api";
import PageTransition from "../components/PageTransition";
import LeftArrow from "../assets/arrow_left.svg";
import TabMenu from "../components/TabMenu";
import BottomNav from "../components/BottomNav";

const containerStyle = {
  width: "100%",
  height: "100%",
};

// 초기 중심 좌표
const center = {
  lat: 37.521,
  lng: 127.023,
};

// 더미데이터
const mockLocations = [
  {
    id: 1,
    restaurantName: "더미1",
    lat: 37.525,
    lng: 127.028,
    image: "https://images.unsplash.com/photo-1525648199074-cee30ba79a4a?q=80&w=200&auto=format&fit=crop",
  },
  {
    id: 2,
    restaurantName: "더미2",
    lat: 37.522,
    lng: 127.029,
    image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=200&auto=format&fit=crop",
  },
  {
    id: 3,
    restaurantName: "더미3",
    lat: 37.527,
    lng: 127.022,
    image: "https://images.unsplash.com/photo-1525648199074-cee30ba79a4a?q=80&w=200&auto=format&fit=crop",
  },
];

export default function Map() {
  const navigate = useNavigate();

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAP_API_KEY,
    language: "ko",
    region: "KR",
  });

  const [map, setMap] = useState(null);

  const onLoad = useCallback(function callback(map) {
    setMap(map);
  }, []);

  const onUnmount = useCallback(function callback(map) {
    setMap(null);
  }, []);

  return (
    <>
      <PageTransition className="min-h-dvh w-full flex flex-col relative bg-[#FFFDF8] overflow-auto pb-24">
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

        {/* 구글 맵 영역 */}
        <div className="flex-1 relative z-0">
          <div className="absolute inset-0">
            {isLoaded ? (
              <GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                zoom={15}
                onLoad={onLoad}
                onUnmount={onUnmount}
                options={{
                  disableDefaultUI: true,
                  zoomControl: false,
                }}
              >
                {/* 커스텀 마커 그리기 */}
                {mockLocations.map((loc) => (
                  <OverlayViewF key={loc.id} position={{ lat: loc.lat, lng: loc.lng }} mapPaneName="overlayMouseTarget">
                    <div
                      className="relative -translate-x-1/2 -translate-y-1/2 cursor-pointer active:scale-90 transition-transform"
                      onClick={() => alert("구현 예정입니다.")}
                    >
                      {/* 마커 스타일 */}
                      <div className="w-[50px] h-[50px] rounded-full overflow-hidden border-[3.5px] border-[#FF6C2A] shadow-[0_4px_10px_rgba(248,101,22,0.4)]">
                        <img src={loc.image} className="w-full h-full object-cover" />
                      </div>
                    </div>
                  </OverlayViewF>
                ))}
              </GoogleMap>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-[#F86516] font-bold text-sm">지도를 불러오는 중...</span>
              </div>
            )}
          </div>
        </div>
      </PageTransition>

      {/* 네비게이션 바 */}
      <BottomNav />
    </>
  );
}
