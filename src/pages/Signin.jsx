import { useNavigate, Link } from "react-router-dom";
import signinImg from "../assets/signin.png";
import "./Signin.css";
import { useState } from "react";
import api from "../api/axiosConfig";

export default function Signin() {
  const navigate = useNavigate();

  const handleLogo = () => {
    navigate("/");
  };

  // 아이디, 비밀번호 상태 관리
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");

  // 규칙
  const id_valid = /^[a-zA-Z0-9]{5,20}$/;
  const pw_valid =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{8,20}$/;

  // 로그인 처리 함수

  const handleLogin = async () => {
    // 유효성 검사
    if (!id_valid.test(id)) {
      alert("아이디는 영문+숫자 5~20자여야 합니다.");
      return;
    }

    if (!pw_valid.test(pw)) {
      alert("비밀번호는 영문, 숫자, 특수문자 포함 8~20자여야 합니다.");
      return;
    }

    const requestData = {
      loginId: id,
      password: pw,
    };

    console.log("전송 데이터:", requestData);

    try {
      const response = await api.post("/auth/login", requestData);

      console.log("로그인 성공:", response.data);

      //  localStorage에 로그인 정보 저장
      localStorage.setItem("isLoggedIn", "true");

      // 서버에서 토큰을 응답으로 보내준다면 저장
      if (response.data.accessToken) {
        localStorage.setItem("accessToken", response.data.accessToken);
      }
      if (response.data.refreshToken) {
        localStorage.setItem("refreshToken", response.data.refreshToken);
      }
      if (response.data.userName) {
        localStorage.setItem("userName", response.data.userName);
      }

      alert("로그인 성공!");
      navigate("/");
    } catch (error) {
      console.error("로그인 실패:", error);

      if (error.response) {
        const errorMessage =
          error.response.data.message || error.response.data.error;

        if (error.response.status === 401) {
          alert("아이디 또는 비밀번호가 일치하지 않습니다.");
        } else if (errorMessage) {
          alert(`로그인 실패: ${errorMessage}`);
        } else {
          alert("로그인에 실패했습니다. 입력 정보를 확인해주세요.");
        }
      } else if (error.request) {
        alert("서버와 연결할 수 없습니다. 네트워크를 확인해주세요.");
      } else {
        alert("로그인 중 오류가 발생했습니다.");
      }
    }
  };
  return (
    <div className="signin-container">
      {/* Left Side */}
      <div className="signin-page-left">
        <button className="logo-button" onClick={handleLogo}>
          BreadCast
        </button>
        <div className="left-content">
          <h2>쉽게 하나로 모여있는 빵맛집 정보</h2>
          <p>숨은 빵집을 찾아다니는 빵지순례</p>
          <div className="bread-illustration">
            <img src={signinImg} alt="BreadCast" className="bread-img" />
          </div>
        </div>
      </div>

      {/* Right Side */}
      <div className="signin-page-right">
        <div className="signin-page-right-top">
          <h1>
            Sign-in
            <br />
            BreadCast
          </h1>
          <p>반갑습니다! 로그인하여 참여해보세요</p>
        </div>

        <div className="signin-form">
          <input
            type="text"
            placeholder="아이디"
            value={id}
            onChange={(e) => setId(e.target.value)}
            className="signin-input"
          />
          {id !== "" && !id_valid.test(id) && (
            <span className="error-message">
              아이디는 영문+숫자 5~20자여야 합니다.
            </span>
          )}

          <input
            type="password"
            placeholder="비밀번호"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            className="signin-input"
          />
          {pw !== "" && !pw_valid.test(pw) && (
            <span className="error-message">
              비밀번호는 영문, 숫자, 특수문자 포함 8~20자여야 합니다.
            </span>
          )}

          <button onClick={handleLogin} className="signin-button">
            로그인
          </button>

          <Link to="/signup" className="signup-button">
            회원가입
          </Link>
        </div>
      </div>
    </div>
  );
}
