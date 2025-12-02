// src/components/home/HeroIntro.jsx

import React from "react";
import "./HeroIntro.css"; // 전용 스타일 파일 import
import { Link } from "react-router-dom"; // 👈 1. 페이지 이동을 위해 Link를 import 합니다.
import heroLogo from "../../assets/new logo.png";
import introIcon from "../../assets/Group 300.png";

function HeroIntro() {
  return (
    <div className="hero-intro-container">
      {/* -------------------- 1. 상단 배너 영역 (Hero) -------------------- */}
      <section className="hero-section">
        {/* 배경 이미지는 CSS에서 처리합니다. */}

        {/* ⬇️ 2. 이 헤더(네비게이션) 부분을 새로 추가합니다 ⬇️ */}
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
          <div className="hero-auth-buttons">
            {/* 로그인 , 회원가입 */}
            <button className="btn-login-hero">
              <Link to="/signin"> signin</Link>
            </button>

            <button className="btn-signup-hero">
              <Link to="/signup"> signup </Link>
            </button>
          </div>
        </header>
        {/* ⬆️ 여기까지가 새로 추가된 헤더입니다 ⬆️ */}

        <div className="hero-content">
          <h1>BreadCast</h1>
          <p className="slogan-main">쉽게 하나로 모여있는 빵 맛집 정보</p>
          <p className="slogan-sub">숨은 빵집을 찾아다니는 빵지순례</p>
        </div>
      </section>

      {/* -------------------- 2. 서비스 소개 영역 (Intro) -------------------- */}
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
