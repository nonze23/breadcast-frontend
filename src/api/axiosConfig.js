import axios from "axios";

// 환경별 baseURL 설정
const getBaseURL = () => {
  // 개발 환경: 빈 값 (프록시 사용)
  if (import.meta.env.DEV) {
    console.log("🔧 개발 환경: 프록시 사용");
    return "";
  }

  // 프로덕션 환경: 실제 API 서버 주소
  const baseURL =
    import.meta.env.VITE_API_BASE_URL || "https://breadcast.duckdns.org";
  console.log("🚀 프로덕션 환경:", baseURL);
  return baseURL;
};

const api = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true, // 쿠키 자동 포함
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// 요청 인터셉터
api.interceptors.request.use(
  (config) => {
    console.log("🚀 [API 요청]", config.method.toUpperCase(), config.url);
    console.log("   baseURL:", config.baseURL);
    return config;
  },
  (error) => {
    console.error("❌ [요청 에러]", error);
    return Promise.reject(error);
  }
);

// 응답 인터셉터
let isRedirecting = false; // 전역 플래그: 중복 리다이렉트 방지

api.interceptors.response.use(
  (response) => {
    console.log("✅ [API 응답]", response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error("❌ [응답 에러]", error.response?.status, error.config?.url);

    // 401 Unauthorized - 자동 로그인 페이지 이동
    if (error.response?.status === 401) {
      // 이미 리다이렉트 중이면 중복 실행 방지
      if (isRedirecting) {
        return Promise.reject(error);
      }
      
      isRedirecting = true;
      console.warn("⚠️ 인증 만료 - 로그인 페이지로 이동");

      // 현재 경로가 로그인/회원가입 페이지가 아닐 때만 alert 표시
      const currentPath = window.location.pathname;
      if (!currentPath.includes("/signin") && !currentPath.includes("/signup")) {
        alert("로그인이 필요한 서비스입니다.");
      }

      // localStorage 정리
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("userName");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");

      // 로그인 페이지로 리다이렉트
      window.location.href = "/signin";
    }

    return Promise.reject(error);
  }
);

export default api;
