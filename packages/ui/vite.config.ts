import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Storybook이 쓴다(react-vite가 이 설정을 병합한다). Tailwind v4는 자체 vite 플러그인으로
// 돌아서, 스토리도 src/styles/globals.css의 공유 @theme 토큰을 그대로 받는다.
export default defineConfig({
  plugins: [react(), tailwindcss()],
});
