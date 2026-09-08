import { defineConfig } from "tsdown";

export default defineConfig([
  // Build the self-contained Context Tree skill.
  // The CLI and all dependencies are bundled into the skill directory so
  // AI assistants can use the skill without requiring the package to be installed.
  {
    entry: "./src/core/cli.ts",
    outDir: "./skills/context-tree/scripts/",
    deps: { alwaysBundle: /.*/ },
    outputOptions: {
      preserveModules: true,
    },
  },

  // Build the standalone CLI package.
  // Dependencies are kept external because the published package provides
  // the CLI entry point while its runtime dependencies are resolved normally.
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
