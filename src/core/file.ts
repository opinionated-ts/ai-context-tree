import { existsSync, statSync } from "node:fs";
import { dirname, relative, resolve, sep } from "node:path";

import { createGitignoreChecker } from "@/gitignore";
import { findIndexFiles } from "@/parse";

export interface ResolvedIndexGroup {
  group: string;
  inputs: string[];
  index: string;
  parents: string[];
}

export interface ResolveIndexForPathsOptions {
  root?: string;
  includeParents?: boolean;
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

function getParentsForGroup(
  root: string,
  group: string,
  indexPathsByFolder: Map<string, string>,
): string[] {
  if (group === ".") {
    return [];
  }

  const parents: string[] = [];
  let current = resolve(root, group);

  while (true) {
    current = dirname(current);

    if (current === root) {
      const rootIndex = indexPathsByFolder.get(".");
      if (rootIndex) {
        parents.push(rootIndex);
      }
      break;
    }

    const nextGroup = relative(root, current).split(sep).join("/") || ".";
    const parentIndex = indexPathsByFolder.get(nextGroup);
    if (parentIndex) {
      parents.push(parentIndex);
    }
  }

  return parents;
}

function getNearestIndexForPath(
  root: string,
  relativeInput: string,
  indexPathsByFolder: Map<string, string>,
): { group: string; index: string } | null {
  const absoluteInput = resolve(root, relativeInput);

  if (!existsSync(absoluteInput)) {
    return null;
  }

  let current = statSync(absoluteInput).isDirectory() ? absoluteInput : dirname(absoluteInput);

  while (true) {
    const relativeDirectory = relative(root, current).split(sep).join("/") || ".";
    const indexPath = indexPathsByFolder.get(relativeDirectory);

    if (indexPath) {
      return {
        group: relativeDirectory,
        index: indexPath,
      };
    }

    if (current === root) {
      return null;
    }

    current = dirname(current);
  }
}

export async function resolveIndexForPaths(
  paths: string | string[],
  options: ResolveIndexForPathsOptions = {},
): Promise<ResolvedIndexGroup[]> {
  const root = resolve(options.root ?? process.cwd());
  const inputPaths = Array.isArray(paths) ? paths : [paths];
  const shouldIgnore = createGitignoreChecker(root);
  const entries = await findIndexFiles(root);
  const indexPathsByFolder = new Map<string, string>();

  for (const entry of entries) {
    const folder = entry.folderPath === "." ? "." : entry.folderPath.split(sep).join("/");
    indexPathsByFolder.set(folder, entry.filePath);
  }

  const groups = new Map<string, ResolvedIndexGroup>();

  for (const rawInput of inputPaths) {
    const normalizedInput = normalizeProjectRelativePath(root, rawInput);

    if (!normalizedInput) {
      continue;
    }

    const absoluteInput = resolve(root, normalizedInput);
    if (shouldIgnore(absoluteInput)) {
      continue;
    }

    const nearest = getNearestIndexForPath(root, normalizedInput, indexPathsByFolder);

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
    previous.parents = options.includeParents
      ? getParentsForGroup(root, nearest.group, indexPathsByFolder)
      : [];
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
