import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";
import path from "path";

// chemins vers les certificats
const keyPath = path.resolve(__dirname, "../server/src/127.0.0.1-key.pem");
const certPath = path.resolve(__dirname, "../server/src/127.0.0.1.pem");


export default defineConfig({
  plugins: [react()],
  server: {
    https: {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath),
    },
    host: "127.0.0.1",
    port: 5173,
  },
});
