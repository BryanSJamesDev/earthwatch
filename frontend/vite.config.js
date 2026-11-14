import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    // in development the api runs on express, this keeps requests same-origin
    proxy: {
      "/api": "http://localhost:3000",
    },
  },
});
