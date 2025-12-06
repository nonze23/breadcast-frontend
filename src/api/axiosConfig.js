import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // 🔥 /api와 /auth 둘 다 프록시 (정규식 사용)
      "^/(api|auth)": {
        target: "https://breadcast.duckdns.org",
        changeOrigin: true,
        secure: false,
        cookieDomainRewrite: "localhost",

        configure: (proxy, _options) => {
          proxy.on("proxyReq", (proxyReq, req, res) => {
            console.log("🔄 [프록시 요청]", req.method, req.url);
            console.log(
              "   → 전달:",
              `https://breadcast.duckdns.org${req.url}`
            );
          });

          proxy.on("proxyRes", (proxyRes, req, res) => {
            console.log("✅ [프록시 응답]", proxyRes.statusCode, req.url);
            const cookies = proxyRes.headers["set-cookie"];
            if (cookies) {
              console.log("   🍪 쿠키 설정:", cookies);
            }
          });

          proxy.on("error", (err, req, res) => {
            console.error("❌ [프록시 에러]", err.message);
          });
        },
      },
    },
  },
});
