// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  plugins: [react()],
  root: "src",                 // ✅ keep your original layout
  test: {
    environment: "happy-dom",
    setupFiles: ["./setupVitest.js"],
  },
  server: {
    port: 5173,
    proxy: {
      // keep the /api prefix so it hits /api/* on your server
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        // ❌ remove rewrite — it was causing /api/getHeartRate → /getHeartRate (404)
        // rewrite: (p) => p.replace(/^\/api/, ""),
      },
      // VO₂ endpoint is not prefixed with /api, so proxy it as-is
      "/getVO2MaxData": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});



// import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react";
// import dotenv from "dotenv";

// dotenv.config();

// export default defineConfig({
//   plugins: [react()],
//   root: "src",
//   test: {
//     environment: "happy-dom",
//     setupFiles: ["./setupVitest.js"],
//   },
//   server: {
//     port: 5173,
//     proxy: {
//       // single proxy entry; everything under /api goes to your Express app
//       "/api": {
//         target: "http://localhost:3000",
//         changeOrigin: true,
//         // strip the /api prefix before hitting the backend
//         rewrite: (p) => p.replace(/^\/api/, ""),
//       },
//     },
//   },
// });

// import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react";
// import dotenv from "dotenv";

// dotenv.config();

// export default defineConfig({
//   plugins: [react()],
//   root: "src",
//   test: {
//     environment: "happy-dom",
//     setupFiles: ["./setupVitest.js"],
//   },
//   server: {
//     port: 5173,
//     proxy: {
//       "/api": {
//         target: "http://localhost:3000",
//         changeOrigin: true,
//       },
//       "/getUsers": {
//         target: "http://localhost:3000",
//         changeOrigin: true,
//       },
//       "/updateRole": {
//         target: "http://localhost:3000",
//         changeOrigin: true,
//       },
//     },
//   },
// });
