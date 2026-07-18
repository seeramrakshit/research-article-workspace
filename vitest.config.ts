import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

export default defineConfig({
  plugins: [tsconfigPaths()], // so `~/` imports resolve the same as in Next.js
  resolve: {
    alias: {
      "next/server": path.resolve(__dirname, "./node_modules/next/server.js"),
      "next/headers": path.resolve(__dirname, "./node_modules/next/headers.js"),
    },
  },
  test: {
    environment: "node",
    setupFiles: ["./vitest.setup.ts"],
    server: {
      deps: {
        inline: ["next-auth"],
      },
    },
  },
});
