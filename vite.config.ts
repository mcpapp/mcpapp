import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const external = [
  "@json-render/core",
  "@json-render/mcp",
  "@json-render/mcp/build-app-html",
  "@json-render/react",
  "@json-render/shadcn",
  "@modelcontextprotocol/ext-apps",
  "@modelcontextprotocol/ext-apps/app-bridge",
  "@modelcontextprotocol/ext-apps/react",
  "@modelcontextprotocol/sdk/client/index.js",
  "@modelcontextprotocol/sdk/client/streamableHttp.js",
  "@modelcontextprotocol/sdk/types.js",
  "react",
  "react/jsx-runtime",
];

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler", { target: "19" }]],
      },
    }),
  ],
  build: {
    lib: {
      entry: {
        index: "src/index.ts",
        server: "src/server.ts",
        web: "src/web.ts",
      },
      formats: ["es"],
    },
    rollupOptions: {
      external,
      output: {
        entryFileNames: "[name].js",
        preserveModules: false,
      },
    },
    sourcemap: true,
    target: "esnext",
  },
  test: {
    environment: "jsdom",
    setupFiles: ["test/setup.ts"],
  },
});
