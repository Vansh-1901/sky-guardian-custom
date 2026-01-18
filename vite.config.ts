import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig({
  server: {
    host: "0.0.0.0",
    port: 8081,

    // allow Cloudflare / ngrok / phone access
    allowedHosts: true,

    hmr: {
      clientPort: 443,
    },
  },

  plugins: [
    react(),
    componentTagger(), // safe to always enable
  ],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
