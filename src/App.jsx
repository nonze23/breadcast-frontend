import React from "react";
// 1. react-router-dom에서 Outlet을 꼭 추가로 가져와야 합니다.
import { Routes, Route, Outlet } from "react-router-dom";
import Sidebar from "./pages/Sidebar";
import Navbar from "./pages/Navbar";
import HomePage from "./pages/HomePage";
import MyPage from "./pages/MyPage";
import SearchPage from "./pages/SearchPage";
import BakeryDetail from "./pages/BakeryDetail";
import Signin from "./pages/Signin.jsx";
import Signup from "./pages/Signup.jsx";
import FavoriteStoresPage from "./pages/FavoriteStoresPage";
import "./App.css";
import BakeryTour from "./pages/BakeryTour.jsx";
import BakeryTourForm from "./pages/BakeryTourForm.jsx";
import MyReview from "./pages/MyReview.jsx";

import "./App.css";

// 3. '사이드바 + 네비바'가 있는 페이지의 "틀"을 여기서 만듭니다.
//    (새 파일 만들 필요 없이 App.jsx 안에 그냥 두세요)
const MainLayout = () => {
  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        {/*'Outlet'은 '검색', '빵지순례' 페이지 등이 
              표시될 "빈 공간"이라는 뜻입니다. */}
        <Outlet />
      </main>
    </div>
  );
};

// 4. App 본체입니다.
function App() {
  return (
    <Routes>
      {/* 경로 1: 'MainLayout' (틀) 없이 'HomePage' 컴포넌트만 보여준다.
       */}
      <Route path="/" element={<HomePage />} />
      <Route path="/signin" element={<Signin />} />
      <Route path="/signup" element={<Signup />} />

      {/* 경로 2:'MainLayout' (틀)을 먼저 보여주고, 그 안의 'Outlet' 자리에 해당 페이지를 보여준다.
       */}
      <Route element={<MainLayout />}>
        <Route path="/search" element={<SearchPage />} />
        <Route path="/bakery/:bakeryId" element={<BakeryDetail />} />
        <Route path="/bakery-tour" element={<BakeryTour />} />
        <Route path="/bakery-tour/write" element={<BakeryTourForm />} />

        <Route path="/mypage" element={<MyPage />} />
        <Route
          path="/mypage/favorites/store"
          element={<FavoriteStoresPage />}
        />
        <Route path="/mypage/reviews/store" element={<MyReview />}></Route>
      </Route>
    </Routes>
  );
}

export default App;
//
