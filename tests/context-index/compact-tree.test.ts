import { describe, expect, it } from "bun:test";
import { mkdtempSync } from "fs";
import { mkdirSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

import { generateContextTree } from "@/index";

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

    const lines = out.split("\n").filter(Boolean);
    expect(lines).toContain("src — Source code");
    expect(lines).toContain("src/utils — Utils");
  });

  it("omits em-dash when description is empty", async () => {
    const tmp = mkdtempSync(join(tmpdir(), "ct-"));

    writeIndex(join(tmp, "empty"));

    const out = await generateContextTree({ root: tmp, format: "compact-tree" });
    const lines = out.split("\n").filter(Boolean);

    expect(lines).not.toContain("empty");
    expect(lines.some((l) => l.includes("empty —"))).toBe(false);
  });

  it("skips undocumented intermediate folders in nested paths", async () => {
    const tmp = mkdtempSync(join(tmpdir(), "ct-"));

    writeIndex(join(tmp, "folder1"));
    writeIndex(join(tmp, "folder1", "folder2"));
    writeIndex(join(tmp, "folder1", "folder2", "leaf"), "Leaf");

    const out = await generateContextTree({ root: tmp, format: "compact-tree" });
    const lines = out.split("\n").filter(Boolean);

    expect(lines).not.toContain("folder1/folder2");
    expect(lines).not.toContain("folder1/folder2 —");
    expect(lines).toContain("folder1/folder2/leaf — Leaf");
  });
});
