import { cspellConfig } from "@opinionated-ts/config";
import { defineConfig } from "cspell";

export default defineConfig({
  ...cspellConfig,

  dictionaries: [
    ...cspellConfig.dictionaries,
    // Custom dictionaries here
  ],

  import: [
    ...cspellConfig.import,
    // Custom import paths here
  ],

  words: [
    ...cspellConfig.words,
    // Custom words here
  ],

  // Any additional custom configuration here
});
