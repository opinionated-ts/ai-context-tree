import { oxlintConfig } from "@opinionated-ts/config";
import { defineConfig } from "oxlint";

export default defineConfig({
  extends: [oxlintConfig],
  ignorePatterns: ["skills"],
  rules: {
    // Custom rules here
  },
});
