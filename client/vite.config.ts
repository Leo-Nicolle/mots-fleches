import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [
    vue(),
    {
      name: "configure-server",
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          // Check cookies to determine whether to apply COEP/COOP headers
          const cookies = req.headers.cookie || "";
          const hasCOEPCookie = cookies.includes(
            "cross-origin-embedder-policy=credentialless"
          );
          const hasCOOPCookie = cookies.includes(
            "cross-origin-opener-policy=same-origin"
          );

          if (hasCOEPCookie && hasCOOPCookie) {
            res.setHeader("Cross-Origin-Embedder-Policy", "credentialless");
            res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
          }

          next();
        });
      },
    },
  ],
  envDir: "envs/",
  server: {
    port: 5173,
  },
});
