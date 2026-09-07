import { describe, expect, it } from "bun:test";
import { mkdtempSync } from "fs";
import { mkdirSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

import { generateContextTree } from "../../scripts/context-index/index";

function writeIndex(dir: string, desc?: string) {
  mkdirSync(dir, { recursive: true });
  const content = desc ? `---\ndescription: ${desc}\n---\n` : "# no frontmatter\n";
  writeFileSync(join(dir, "index.instructions.md"), content);
}

describe("compact-tree format", () => {
  it("includes inline descriptions when present", async () => {
    const tmp = mkdtempSync(join(tmpdir(), "ct-"));

    writeIndex(join(tmp, "src"), "Source code");
    writeIndex(join(tmp, "src", "utils"), "Utils");

    const out = await generateContextTree({ root: tmp, format: "compact-tree" });
    expect(typeof out).toBe("string");

    const lines = (out as string).split("\n").filter(Boolean);
    expect(lines).toContain("src — Source code");
    expect(lines).toContain("src/utils — Utils");
  });

  it("omits em-dash when description is empty", async () => {
    const tmp = mkdtempSync(join(tmpdir(), "ct-"));

    writeIndex(join(tmp, "empty"));

    const out = await generateContextTree({ root: tmp, format: "compact-tree" });
    const lines = (out as string).split("\n").filter(Boolean);

    // Should list the folder but not include an em-dash
    expect(lines).toContain("empty");
    expect(lines.some((l) => l.includes("empty —"))).toBe(false);
  });
});
