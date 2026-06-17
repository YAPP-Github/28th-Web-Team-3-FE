import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Used by Storybook (react-vite merges this). Tailwind v4 runs via its vite plugin,
// so stories pick up the shared @theme tokens from src/styles/globals.css.
export default defineConfig({
  plugins: [react(), tailwindcss()],
});
