// src/components/Sidebar.jsx

import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import "./Sidebar.css";
import logoImg from "../assets/logo.png";

function Sidebar() {
  // 현재 페이지의 URL 정보를 가져옵니다.
  const location = useLocation();

  // 현재 URL을 기준으로 하위 메뉴를 열지 결정합니다.
  const isBakeryMenuOpen = location.pathname.startsWith("/bakery-tour");
  const isMyPageMenuOpen = location.pathname.startsWith("/mypage");

  return (
    <aside className="sidebar">
      <div className="logo">
        <img src={logoImg} alt="Breadcast Logo" />
        <span>BreadCast</span>
      </div>

      <nav className="sidebar-nav">
        <ul>
          <li>
            <NavLink to="/">홈</NavLink>
          </li>
          <li>
            <NavLink to="/search">검색</NavLink>
          </li>

          <li className="has-submenu">
            <NavLink to="/bakery-tour">빵지순례</NavLink>
            {isBakeryMenuOpen && (
              <ul className="submenu">
                <li>
                  <NavLink to="/bakery-tour/write">빵지순례 작성하기</NavLink>
                </li>
              </ul>
            )}
          </li>

          <li className="has-submenu">
            <NavLink to="/mypage">마이페이지</NavLink>
            {isMyPageMenuOpen && (
              <ul className="submenu">
                <li className="submenu-header">즐겨찾기</li>
                <ul className="submenu-group">
                  <li>
                    <NavLink to="/mypage/favorites/store">가게</NavLink>
                  </li>
                </ul>

                <li className="submenu-header">내가 작성한 리뷰보기</li>
                <ul className="submenu-group">
                  <li>
                    <NavLink to="/mypage/reviews/store">가게 리뷰</NavLink>
                  </li>
                </ul>
              </ul>
            )}
          </li>
        </ul>
      </nav>
    </aside>
  );
}

export default Sidebar;
