import { defineConfig } from "tsdown";

export default defineConfig([
  // Build the CLI package.
  // This produces the executable entry point for the Context Tree CLI.
  {
    entry: "./src/core/cli.ts",
    outputOptions: {
      banner: "#!/usr/bin/env node",
    },
    exports: {
      bin: true,
      exclude: ["./cli"],
    },
  },

  // Build the programmatic API.
  // This produces the package entry point and its TypeScript declarations so
  // other projects can import Context Tree functionality as a library.
  {
    entry: "./src/core/index.ts",
    dts: true,
    exports: true,
  },
]);
