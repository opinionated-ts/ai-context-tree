import { existsSync, statSync } from "node:fs";
import { dirname, relative, resolve, sep } from "node:path";

import { createGitignoreChecker } from "@/gitignore";

export interface ResolvedIndexGroup {
  group: string;
  inputs: string[];
  index: string;
  parents: string[];
}

export interface ResolveIndexForPathsOptions {
  root?: string;
  skipParents?: boolean;
}

function normalizeProjectRelativePath(root: string, input: string): string | null {
  const absolutePath = resolve(root, input);
  const relativePath = relative(root, absolutePath);

  if (relativePath === "") {
    return ".";
  }

  if (
    relativePath === ".." ||
    relativePath.startsWith(".." + sep) ||
    relativePath.startsWith("../")
  ) {
    return null;
  }

  return relativePath.split(sep).join("/");
}

function getNearestIndexForPath(
  root: string,
  relativeInput: string,
  shouldIgnore: (path: string) => boolean,
  skipParents: boolean,
): { group: string; index: string; parents: string[] } | null {
  const absoluteInput = resolve(root, relativeInput);

  if (!existsSync(absoluteInput)) {
    return null;
  }

  let current = statSync(absoluteInput).isDirectory() ? absoluteInput : dirname(absoluteInput);
  let nearest: { group: string; index: string } | null = null;
  const parents: string[] = [];

  while (true) {
    const relativeDirectory = relative(root, current).split(sep).join("/") || ".";
    const indexPath = resolve(current, "index.instructions.md");

    if (existsSync(indexPath) && !shouldIgnore(indexPath)) {
      const normalizedIndex = relative(root, indexPath).split(sep).join("/");

      if (!nearest) {
        nearest = {
          group: relativeDirectory,
          index: normalizedIndex,
        };

        if (skipParents) {
          break;
        }
      } else {
        parents.push(normalizedIndex);
      }
    }

    if (current === root) {
      break;
    }

    const parent = dirname(current);
    if (parent === current) {
      break;
    }

    current = parent;
  }

  if (!nearest) {
    return null;
  }

  return {
    group: nearest.group,
    index: nearest.index,
    parents: skipParents ? [] : parents,
  };
}

export async function resolveIndexForPaths(
  paths: string | string[],
  options: ResolveIndexForPathsOptions = {},
): Promise<ResolvedIndexGroup[]> {
  const root = resolve(options.root ?? process.cwd());
  const inputPaths = Array.isArray(paths) ? paths : [paths];
  const shouldIgnore = createGitignoreChecker(root);
  const groups = new Map<string, ResolvedIndexGroup>();

  // `root` is the upper boundary for ancestor lookup: we start from each input path,
  // walk upward toward its parent directories, and stop once we reach `root`.
  for (const rawInput of inputPaths) {
    const normalizedInput = normalizeProjectRelativePath(root, rawInput);

    if (!normalizedInput) {
      continue;
    }

    const absoluteInput = resolve(root, normalizedInput);
    if (shouldIgnore(absoluteInput)) {
      continue;
    }

    const nearest = getNearestIndexForPath(
      root,
      normalizedInput,
      shouldIgnore,
      !!options.skipParents,
    );

    if (!nearest) {
      continue;
    }

    const previous = groups.get(nearest.group) ?? {
      group: nearest.group,
      inputs: [],
      index: nearest.index,
      parents: [],
    };

    previous.inputs.push(normalizedInput);
    previous.index = nearest.index;
    previous.parents = options.skipParents ? [] : nearest.parents;
    groups.set(nearest.group, previous);
  }

  return [...groups.values()]
    .map((group) => ({
      ...group,
      inputs: [...new Set(group.inputs)].toSorted((left, right) => left.localeCompare(right)),
      parents: [...new Set(group.parents)],
    }))
    .toSorted((left, right) => left.group.localeCompare(right.group));
}

export const resolveAssociatedIndexes = resolveIndexForPaths;

export async function resolveIndexForPath(
  path: string,
  options: ResolveIndexForPathsOptions = {},
): Promise<ResolvedIndexGroup | null> {
  const result = await resolveIndexForPaths([path], options);
  return result[0] ?? null;
}
