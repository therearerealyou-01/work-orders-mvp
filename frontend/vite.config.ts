import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const api = "http://127.0.0.1:3001";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      "/auth": { target: api, changeOrigin: true },
      "/orders": { target: api, changeOrigin: true },
      "/teams": { target: api, changeOrigin: true },
      "/health": { target: api, changeOrigin: true },
      "/socket.io": { target: api, changeOrigin: true, ws: true },
    },
  },
});

