import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "https://fyp-ashen-kappa.vercel.app", // Fallback target direct to Vercel
        changeOrigin: true,
        secure: false,
      },
    },
  },
});