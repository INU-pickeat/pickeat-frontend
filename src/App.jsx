import { lazy, Suspense, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import Splash from "./components/common/Splash";
import Intro from "./pages/Intro";

// 방문한 페이지의 코드만 불러오기
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Home = lazy(() => import("./pages/Home"));
const Explore = lazy(() => import("./pages/Explore"));
const Restaurant = lazy(() => import("./pages/Restaurant"));
const Feed = lazy(() => import("./pages/Feed"));
const Recent = lazy(() => import("./pages/Recent"));
const MyPage = lazy(() => import("./pages/MyPage"));
const MyInfoEdit = lazy(() => import("./pages/MyInfoEdit"));
const Notifications = lazy(() => import("./pages/Notifications"));
const LocationConfirm = lazy(() => import("./pages/LocationConfirm"));
const LocationSearch = lazy(() => import("./pages/LocationSearch"));
const SituationSelect = lazy(() => import("./pages/SituationSelect"));
const CategorySelect = lazy(() => import("./pages/CategorySelect"));
const CompleteSelect = lazy(() => import("./pages/CompleteSelect"));
const PriceSelect = lazy(() => import("./pages/PriceSelect"));
const RecommendLoading = lazy(() => import("./pages/RecommendLoading"));
const RecommendResult = lazy(() => import("./pages/RecommendResult"));
const Calendar = lazy(() => import("./pages/Calendar"));
const Write = lazy(() => import("./pages/Write"));
const History = lazy(() => import("./pages/History"));
const Map = lazy(() => import("./pages/Map"));

// 앱 라우팅과 초기 스플래시
export default function App() {
  // 스플래시 애니메이션 상태
  const [showSplash, setShowSplash] = useState(() => {
    return window.location.pathname === "/";
  });

  return (
    <div className="app-shell min-h-dvh w-full bg-white sm:bg-neutral-100 flex justify-center items-start sm:items-center scrollbar-hide">
      <main className="app-viewport w-full max-w-[430px] min-h-dvh bg-white sm:shadow-2xl flex flex-col relative overflow-x-hidden">
        {showSplash ? (
          <Splash onFinish={() => setShowSplash(false)} />
        ) : (
          <BrowserRouter>
            {/* 페이지 코드 로딩 경계 */}
            <Suspense fallback={null}>
              <Routes>
                <Route path="/" element={<Intro />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/home" element={<Home />} />
                <Route path="/explore/:region" element={<Explore />} />
                <Route path="/restaurant/:id" element={<Restaurant />} />
                <Route path="/recent" element={<Recent />} />
                <Route path="/mypage" element={<MyPage />} />
                <Route path="/mypage/edit" element={<MyInfoEdit />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/location" element={<LocationConfirm />} />
                <Route path="/location/custom" element={<LocationSearch />} />
                <Route path="/recommend/situation" element={<SituationSelect />} />
                <Route path="/recommend/category" element={<CategorySelect />} />
                <Route path="/recommend/complete" element={<CompleteSelect />} />
                <Route path="/recommend/price" element={<PriceSelect />} />
                <Route path="/recommend/loading" element={<RecommendLoading />} />
                <Route path="/recommend/result" element={<RecommendResult />} />
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/history/write" element={<Write />} />
                <Route path="/history" element={<History />} />
                <Route path="/feed" element={<Feed />} />
                <Route path="/map" element={<Map />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        )}
      </main>
      <Analytics />
    </div>
  );
}
