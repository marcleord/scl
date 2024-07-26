import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [react()],
    server: {
      proxy: {
        '/bridge': `http://localhost:5000`
      }
    },
});