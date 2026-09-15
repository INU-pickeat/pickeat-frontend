import { useState } from "react";
import Splash from "./components/Splash";
import Login from "./pages/Login";

export default function App() {
  const [showSplash, setShowSplash] = useState(true); // 스플래시 화면 표시 상태

  return (
    <div className="min-h-[100dvh] w-full bg-white sm:bg-neutral-100 flex justify-center items-start sm:items-center scrollbar-hide">
      <main className="w-full max-w-[430px] min-h-[100dvh] bg-white sm:shadow-2xl flex flex-col relative overflow-x-hidden">
        {showSplash ? <Splash onFinish={() => setShowSplash(false)} /> : <Login />}
      </main>
    </div>
  );
}
