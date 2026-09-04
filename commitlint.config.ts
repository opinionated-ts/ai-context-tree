import type { RulesConfig, UserConfig } from "@commitlint/types";

import { commitlintConfig } from "@opinionated-ts/config";

export default {
  ...commitlintConfig,

  rules: {
    // @ts-expect-error -- `commitlintConfig.rules` is incorrectly typed as `CaseRuleConfig` upstream; see conventional-changelog/commitlint#4953
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    ...(commitlintConfig.rules as RulesConfig),

    // Custom rules here
  },
} satisfies UserConfig;

/**
 * The `@ts-expect-error` and lint-disable above work around a known typing
 * issue in `@commitlint/types` — the config itself is valid and works as
 * expected. Safe to keep until the upstream types are fixed.
 *
 * @see https://github.com/conventional-changelog/commitlint/issues/4953
 */
