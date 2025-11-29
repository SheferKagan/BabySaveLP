import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "./",       // IMPORTANT for GitHub Pages
  build: {
    outDir: "docs", // Build into /docs for GitHub Pages
  },
});
