import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  // GitHub Pages serves this app from /web-dev-trainer/, but the local
  // dev server should stay at the root so previews work without a prefix.
  base: command === "build" ? "/web-dev-trainer/" : "/",
}));
