import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import PageTransition from "../components/PageTransition";
import Button from "../components/Button";
import LeftArrow from "../assets/arrow_left.svg";

const libraries = ["places"];

export default function LocationConfirm() {
  const navigate = useNavigate();

  const [neighborhood, setNeighborhood] = useState("위치 확인 중...");
  const [center, setCenter] = useState({ lat: 37.5764, lng: 127.0015 }); // 중심 좌표 (최초 혜화역)

  // 구글맵 API 로드 상태 확인
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAP_API_KEY,
    language: "ko",
    region: "KR",
    libraries,
  });

  // 현재 위치 가져오기
  useEffect(() => {
    if (!isLoaded || !navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const currentLat = position.coords.latitude;
        const currentLng = position.coords.longitude;

        setCenter({ lat: currentLat, lng: currentLng });

        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: { lat: currentLat, lng: currentLng } }, (results, status) => {
          if (status === "OK" && results && results.length > 0) {
            let detectedDong = "";

            // 1순위: '동'
            for (const result of results) {
              const dongComp = result.address_components.find((c) => c.types.includes("sublocality_level_2"));
              if (dongComp) {
                detectedDong = dongComp.short_name;
                break;
              }
            }

            // 2순위: 여러 주소 표현 중 '동/읍/면' 단어 추출
            if (!detectedDong) {
              for (const result of results) {
                const match = result.formatted_address.match(/([가-힣]+(동|읍|면))\b/);
                if (match) {
                  detectedDong = match[1];
                  break;
                }
              }
            }

            // 3순위: '구'
            if (!detectedDong) {
              const guComp = results[0].address_components.find((c) => c.types.includes("sublocality_level_1"));
              detectedDong = guComp ? guComp.short_name : "현재 위치";
            }

            setNeighborhood(detectedDong);
          } else {
            console.error("주소 변환 실패:", status);
            setNeighborhood("현재 위치");
          }
        });
      },
      (error) => {
        console.error("위치 가져오기 실패:", error);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 },
    );
  }, [isLoaded]);

  return (
    <PageTransition className="h-dvh w-full flex flex-col bg-[#FFFDF8]">
      {/* 상단 텍스트 영역 */}
      <div className="pt-10 px-6 pb-6 bg-[#FFFDF8] z-10">
        {/* 뒤로가기 버튼 */}
        <img src={LeftArrow} alt="뒤로가기" className="w-6 h-6 mb-6 cursor-pointer" onClick={() => navigate("/home")} />

        {/* 메인 타이틀 */}
        <div className="flex gap-1.5">
          <h1 className="text-[30px] font-semibold text-[#FF9639] leading-[1.3] tracking-tight">지금</h1>
          <h1 className="text-[30px] font-bold text-[#F86516] leading-[1.3] tracking-tight">{neighborhood}</h1>
        </div>
        <h1 className="text-[30px] font-semibold text-[#FF9639] leading-[1.3] tracking-tight">이신가요?</h1>

        {/* 서브 타이틀 */}
        <p className="mt-4 text-[15px] font-semibold text-[#FF8223]">빠른 맛집 추천을 위해 위치를 확인해요.</p>
      </div>

      {/* 구글 맵 영역 */}
      <div className="flex-1 w-full relative">
        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={{ width: "100%", height: "100%" }}
            center={center}
            zoom={16}
            options={{ disableDefaultUI: true }}
          >
            <Marker position={center} />
          </GoogleMap>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <p className="text-gray-500 font-semibold">지도를 불러오는 중...</p>
          </div>
        )}
      </div>

      {/* 하단 버튼 영역 */}
      <div className="px-6 pt-8 pb-6 flex flex-col space-y-3 bg-[#FFFDF8] z-10 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)]">
        <Button onClick={() => navigate("/recommend/situation")} className="shadow-none">
          네, 맞아요
        </Button>
        <button
          onClick={() => navigate("/location/custom")}
          className="text-[14px] font-semibold text-[#FF8000] active:opacity-60 transition-opacity cursor-pointer py-2"
        >
          아니요, 다른 위치로 설정하기
        </button>
      </div>
    </PageTransition>
  );
}
