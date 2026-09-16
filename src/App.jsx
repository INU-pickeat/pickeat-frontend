import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Splash from "./components/Splash";
import Intro from "./pages/Intro";
import Login from "./pages/Login";

export default function App() {
  const [showSplash, setShowSplash] = useState(true); // 스플래시 화면 표시 상태

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
            </Routes>
          </BrowserRouter>
        )}
      </main>
    </div>
  );
}
