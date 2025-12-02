import React, { useState } from 'react';
import { LuSettings2 } from "react-icons/lu";
import { IoSearch } from "react-icons/io5";
import { FaArrowRight } from "react-icons/fa";
import { FaUser } from "react-icons/fa";
import './Navbar.css'; // Navbar CSS

function Navbar() {
  // 로그인 상태를 관리하는 state. 기본값은 false (로그아웃 상태)
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 버튼 클릭 시 상태를 바꿔보는 임시 함수
  const toggleLogin = () => setIsLoggedIn(!isLoggedIn);

  return (
    <nav className="navbar">
      <div className="search-area"> 
        <button className="filter-button">
          <LuSettings2 size={15} />
          <span>필터</span>
        </button>
        <div className="search-input-wrapper">
          <IoSearch className="search-icon" size={20} />
          <input type="text" placeholder="검색" className="search-input" />
          
        </div>
        <button className="go-button">
          <FaArrowRight size={16}/>
        </button>
      </div>

      <div className="auth-buttons">
        {isLoggedIn ? (
          // 로그인 상태일 때 보여줄 UI
          <>
            <button className="auth-button logout" onClick={toggleLogin}>logout</button>
             <button className="profile-button">
              <FaUser size={20} /> 
            </button>
          </>
        ) : (
          // 로그아웃 상태일 때 보여줄 UI
          <>
            <button className="auth-button login" onClick={toggleLogin}>login</button>
            <button className="auth-button signup">signup</button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;