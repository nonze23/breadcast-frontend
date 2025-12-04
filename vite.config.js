// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://43.200.233.19",
        changeOrigin: true,
        secure: false,
        cookieDomainRewrite: "localhost",
      },
      "/auth": {
        target: "http://43.200.233.19",
        changeOrigin: true,
        secure: false,
        cookieDomainRewrite: "localhost",
      },
    },
  },
});