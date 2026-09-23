import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Splash from "./components/Splash";
import Intro from "./pages/Intro";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ResetPassword from "./pages/ResetPassword";
import Home from "./pages/Home";
import Recent from "./pages/Recent";
import MyPage from "./pages/MyPage";
import LocationConfirm from "./pages/LocationConfirm";
import LocationSearch from "./pages/LocationSearch";
import SituationSelect from "./pages/SituationSelect";
import CategorySelect from "./pages/CategorySelect";

export default function App() {
  // 스플래시 애니메이션 상태
  const [showSplash, setShowSplash] = useState(() => {
    return window.location.pathname === "/";
  });

  return (
    <div className="min-h-dvh w-full bg-white sm:bg-neutral-100 flex justify-center items-start sm:items-center scrollbar-hide">
      <main className="w-full max-w-[430px] min-h-dvh bg-white sm:shadow-2xl flex flex-col relative overflow-x-hidden">
        {showSplash ? (
          <Splash onFinish={() => setShowSplash(false)} />
        ) : (
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Intro />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/home" element={<Home />} />
              <Route path="/recent" element={<Recent />} />
              <Route path="/mypage" element={<MyPage />} />
              <Route path="/location" element={<LocationConfirm />} />
              <Route path="/location/custom" element={<LocationSearch />} />
              <Route path="/recommend/situation" element={<SituationSelect />} />
              <Route path="/recommend/category" element={<CategorySelect />} />
            </Routes>
          </BrowserRouter>
        )}
      </main>
    </div>
  );
}
