import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleMap, useJsApiLoader, Marker, Autocomplete } from "@react-google-maps/api";
import PageTransition from "../components/PageTransition";
import Button from "../components/Button";
import LeftArrow from "../assets/arrow_left.svg";

const libraries = ["places"]; // 연관 장소 목록

export default function LocationSearch() {
  const navigate = useNavigate();

  const [searchInput, setSearchInput] = useState(""); // 검색창 입력값 상태
  const [targetLocation, setTargetLocation] = useState("혜화역"); // 검색 완료된 타겟 지역
  const [center, setCenter] = useState({ lat: 37.5764, lng: 127.0015 }); // 중심 좌표 (최초 혜화역)

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAP_API_KEY,
    language: "ko",
    region: "KR",
    libraries,
  });

  // 연관 장소 자동완성 관련 상태
  const [autocomplete, setAutocomplete] = useState(null);
  const onLoad = (autoC) => setAutocomplete(autoC);
  const onPlaceChanged = () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();

      if (place.geometry && place.geometry.location) {
        // 지도 중심 이동
        setCenter({
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        });

        // 검색창과 하단 버튼 텍스트를 선택한 장소 이름으로 업데이트
        setSearchInput(place.name);
        setTargetLocation(place.name);
      }
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchInput.trim() || !isLoaded) return;

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: searchInput }, (results, status) => {
      if (status === "OK" && results.length > 0) {
        const location = results[0].geometry.location;
        // 지도 중심을 검색된 좌표로 이동
        setCenter({ lat: location.lat(), lng: location.lng() });
        // 하단 버튼 텍스트를 검색한 단어로 변경
        setTargetLocation(searchInput);
      } else {
        alert("검색 결과를 찾을 수 없습니다. 정확한 역명을 입력해 주세요.");
      }
    });
  };

  return (
    <PageTransition className="h-dvh w-full flex flex-col bg-[#FFFDF8]">
      {/* 상단 텍스트 및 검색창 영역 */}
      <div className="pt-10 px-6 pb-6 bg-[#FFFDF8] z-10 flex flex-col">
        {/* 뒤로가기 버튼 */}
        <img
          src={LeftArrow}
          alt="뒤로가기"
          className="w-6 h-6 mb-6 cursor-pointer"
          onClick={() => navigate("/location")}
        />

        {/* 메인 타이틀 */}
        <h1 className="text-[24px] font-semibold text-[#F86516] leading-[1.3] tracking-tight mb-6">
          어디에서 찾고 싶으세요?
        </h1>

        {/* 검색창 폼 영역 */}
        <form
          onSubmit={handleSearch}
          className="flex items-center w-full bg-[#FFECCD] rounded-full px-2.5 py-1 shadow-sm"
        >
          {isLoaded && (
            <Autocomplete
              onLoad={onLoad}
              onPlaceChanged={onPlaceChanged}
              // 한국 안에서만 검색되도록 제한
              options={{
                bounds: new window.google.maps.LatLngBounds({ lat: 33, lng: 124 }, { lat: 39, lng: 132 }),
                strictBounds: false,
              }}
              className="flex-1 min-w-0"
            >
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="지하철역명으로 검색 (ex. 혜화역)"
                className="flex-1 min-w-0 bg-transparent text-[#FF8839] placeholder-[#F86516]/60 font-medium outline-none px-2"
              />
            </Autocomplete>
          )}
          {/* 검색 아이콘 버튼 */}
          <button
            type="submit"
            className="w-8 h-8 min-w-8 rounded-full bg-[#FF9639] flex items-center justify-center shrink-0 active:scale-95 transition-transform cursor-pointer"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5 text-white">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
          </button>
        </form>
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
      <div className="px-6 pt-8 pb-10 bg-[#FFFDF8] z-10 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)]">
        <Button onClick={() => navigate("/recommend/situation")} className="shadow-none">
          {targetLocation} 근처에서 찾아볼게요
        </Button>
      </div>
    </PageTransition>
  );
}
