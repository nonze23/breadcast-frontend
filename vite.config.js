// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // '/api'라는 주소로 요청이 오면 프록시가 작동합니다.
      "/api": {
        target: "http://43.200.233.19", // 실제 백엔드 서버 주소
        changeOrigin: true, // 서버가 요청의 출처를 자신의 도메인으로 인식하게 함 (CORS 해결 핵심)
        rewrite: (path) => path.replace(/^\/api/, ""), // 요청 경로에서 '/api'를 제거하고 백엔드로 보냄
        secure: false, // https가 아닌 http를 쓸 경우 false 설정
      },
    },
  },
});
