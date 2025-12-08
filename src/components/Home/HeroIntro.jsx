import React, { useState, useEffect } from "react";
import "./HeroIntro.css";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axiosConfig"; // ✅ axios 대신 api import
import heroLogo from "../../assets/new logo.png";
import introIcon from "../../assets/Group 300.png";

function HeroIntro() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkLoginStatus = () => {
      const isAuth = localStorage.getItem("isLoggedIn");

      console.log("localStorage isLoggedIn 값:", isAuth); //  디버깅
      console.log("isAuth === 'true':", isAuth === "true"); //  디버깅

      setIsLoggedIn(isAuth === "true");
    };

    checkLoginStatus();
  }, []);

  // 상태 변경 확인
  console.log("현재 isLoggedIn 상태:", isLoggedIn);

  const handleLogout = async () => {
    try {
      // ✅ api.post 사용
      await api.post("/auth/logout");

      // ✅ localStorage 모든 로그인 관련 정보 삭제
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("userName");
      localStorage.removeItem("nickname"); // ✅ 닉네임도 삭제

      setIsLoggedIn(false);
      alert("로그아웃 되었습니다.");
      navigate("/");
    } catch (error) {
      console.error("로그아웃 실패:", error);

      // ✅ 로그아웃 실패해도 로컬 데이터는 삭제
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("userName");
      localStorage.removeItem("nickname");

      setIsLoggedIn(false);

      // ✅ 401은 인터셉터에서 자동 처리
      if (error.response?.status !== 401) {
        alert("로그아웃에 실패했습니다.");
      }

      navigate("/");
    }
  };

  return (
    <div className="hero-intro-container">
      <section className="hero-section">
        <header className="hero-header">
          <div className="hero-logo">
            <Link to="/">
              <img src={heroLogo} alt="BreadCast" />
              <span>BreadCast</span>
            </Link>
          </div>
          <nav className="hero-nav">
            <Link to="/">홈</Link>
            <Link to="/search">검색</Link>
            <Link to="/bakery-tour">빵지순례</Link>
            <Link to="/mypage">마이페이지</Link>
          </nav>

          {/*  디버깅: 둘 다 보이게 해서 확인 */}
          <div className="hero-auth-buttons">
            <p style={{ color: "white" }}>
              로그인상태: {isLoggedIn ? "로그인됨" : "로그아웃됨"}
            </p>

            {!isLoggedIn ? (
              <>
                <button className="btn-login-hero">
                  <Link to="/signin">signin</Link>
                </button>
                <button className="btn-signup-hero">
                  <Link to="/signup">signup</Link>
                </button>
              </>
            ) : (
              <>
                <button className="btn-logout-hero" onClick={handleLogout}>
                  logout
                </button>
                <button>
                  <Link to="/mypage">👤</Link>
                </button>
              </>
            )}
          </div>
        </header>

        <div className="hero-content">
          <h1>BreadCast</h1>
          <p className="slogan-main">쉽게 하나로 모여있는 빵 맛집 정보</p>
          <p className="slogan-sub">숨은 빵집을 찾아다니는 빵지순례</p>
        </div>
      </section>

      <section className="intro-section">
        <div className="intro-visuals">
          <img
            src={introIcon}
            alt="BreadCast 3D 로고와 빵 아이콘"
            className="intro-icon"
          />
        </div>

        <div className="intro-text">
          <p>
            MZ 세대 사이에서 '빵'은 단순한 음식이 아니라 하나의 문화 빵지순례,{" "}
            <br />
            동네 숨은 빵집을 키워드로 빵집을 찾아 다니기 위한 빵(broadcast 관리)
            빵집의 위치를 <br />
            간편하게 볼 수 있고 주변의 빵집의 정보에서부터 빵 메뉴도 볼 수 있는
            플랫폼을 <br />
            여러사람들의 빵지순례 루트를보고 참고하여 자신만의 빵지순례를 만들어
            공유해보아요!
          </p>
        </div>
      </section>
    </div>
  );
}

export default HeroIntro;
