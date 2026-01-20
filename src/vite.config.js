import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

console.log("✅ VITE CONFIG LOADED");

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/places": {
        target: "https://places.googleapis.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/places/, ""),
      },
    },
  },
});
