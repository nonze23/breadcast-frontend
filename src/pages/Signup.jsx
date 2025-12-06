import { useState } from "react";
import { useNavigate } from "react-router-dom";
import signupImg from "../assets/signup.png";
import api from "../api/axiosConfig"; // ✅ axios 대신 api import
import "./Signup.css";

export default function Signup() {
  const navigate = useNavigate();

  const handleLogo = () => {
    navigate("/");
  };

  // 상태 관리
  const [id, setId] = useState("");
  const [nickname, setNickname] = useState("");
  const [pw1, setPw1] = useState("");
  const [pw2, setPw2] = useState("");

  // 규칙
  const id_valid = /^[a-zA-Z0-9]{5,20}$/;
  const pw1_valid =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{8,20}$/;
  const nickname_valid = nickname.trim().length >= 2;

  // 회원가입 처리 함수
  const handleSignup = async () => {
    // 유효성 검사
    if (!id_valid.test(id)) {
      alert("아이디는 영문+숫자 5~20자여야 합니다.");
      return;
    }

    if (!nickname_valid) {
      alert("닉네임은 2글자 이상 입력해주세요.");
      return;
    }

    if (!pw1_valid.test(pw1)) {
      alert("비밀번호는 영문 소+대 특수문자 포함 8~20자여야 합니다.");
      return;
    }

    if (pw1 !== pw2) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    const requestData = {
      loginId: id,
      password: pw1,
      nickname: nickname,
    };

    console.log("전송 데이터:", requestData);

    try {
      // ✅ api.post 사용 + 간소화
      const response = await api.post("/auth/signup", requestData);

      console.log("회원가입 성공:", response.data);
      alert("회원가입 성공! 로그인 페이지로 이동합니다.");
      navigate("/signin");
    } catch (error) {
      console.error("회원가입 실패:", error);

      if (error.response) {
        const errorMessage =
          error.response.data.message || error.response.data.error;

        if (error.response.status === 409) {
          alert("이미 존재하는 아이디입니다.");
        } else if (errorMessage) {
          alert(`회원가입 실패: ${errorMessage}`);
        } else {
          alert("회원가입에 실패했습니다. 입력 정보를 확인해주세요.");
        }
      } else if (error.request) {
        alert("서버와 연결할 수 없습니다. 네트워크를 확인해주세요.");
      } else {
        alert("회원가입 중 오류가 발생했습니다.");
      }
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-page-left">
        <button className="logo-button" onClick={handleLogo}>
          BreadCast
        </button>
        <div className="left-content">
          <h2>쉽게 하나로 모여있는 빵맛집 정보</h2>
          <p>숨은 빵집을 찾아다니는 빵지순례</p>
          <div className="bread-illustration">
            <img src={signupImg} alt="BreadCast" className="bread-img" />
          </div>
        </div>
      </div>

      <div className="signup-page-right">
        <div className="signup-page-right-top">
          <h1>
            sign-up
            <br />
            BreadCast
          </h1>
        </div>
        <div className="signup-form">
          <div className="input-with-button">
            <input
              value={id}
              onChange={(e) => setId(e.target.value)}
              type="text"
              placeholder="아이디 (영문+숫자 5~20자)"
              className="signup-input"
            />
          </div>
          {id !== "" && !id_valid.test(id) && (
            <span className="error-message">
              아이디는 영문+숫자 5~20자여야 합니다.
            </span>
          )}

          <div className="input-with-button">
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="닉네임 (2글자 이상)"
              className="signup-input"
            />
          </div>
          {nickname !== "" && !nickname_valid && (
            <span className="error-message">
              닉네임은 2글자 이상 입력해주세요.
            </span>
          )}

          <div className="input-group">
            <input
              value={pw1}
              onChange={(e) => setPw1(e.target.value)}
              type="password"
              placeholder="비밀번호 : 영문 소+대 특수문자 포함 8~20자"
              className="signup-input-full"
            />
            {pw1 !== "" && !pw1_valid.test(pw1) && (
              <span className="error-message">
                비밀번호는 영문 소+대 특수문자 포함 8~20자여야 합니다.
              </span>
            )}
          </div>

          <div className="input-group">
            <input
              value={pw2}
              onChange={(e) => setPw2(e.target.value)}
              type="password"
              placeholder="비밀번호 재확인"
              className="signup-input-full"
            />
            {pw1 !== "" && pw2 !== "" && pw1 !== pw2 && (
              <span className="error-message">
                비밀번호가 일치하지 않습니다.
              </span>
            )}
          </div>

          <button
            className="signup-button"
            onClick={handleSignup}
            disabled={
              !id_valid.test(id) ||
              !nickname_valid ||
              !pw1_valid.test(pw1) ||
              pw1 !== pw2 ||
              nickname.trim() === ""
            }
          >
            회원가입
          </button>
        </div>
      </div>
    </div>
  );
}
