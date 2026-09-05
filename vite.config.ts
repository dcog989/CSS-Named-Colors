import { svelte } from "@sveltejs/vite-plugin-svelte";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [svelte(), ...(process.env.ANALYZE ? [visualizer({ open: true })] : [])],
  base: "/Color-Sets/",
  build: {
    sourcemap: "hidden",
  },
});
