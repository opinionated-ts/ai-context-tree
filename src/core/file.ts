import { existsSync, statSync } from "node:fs";
import { dirname, relative, resolve, sep } from "node:path";

import { createGitignoreChecker } from "@/gitignore";

/**
 * A group of input paths associated with their nearest index and ancestor
 * indexes.
 */
export interface ResolvedIndexGroup {
  /** Project-relative path of the directory containing the nearest index. */
  group: string;

  /** Project-relative input paths associated with this index. */
  inputs: string[];

  /** Project-relative path to the nearest `index.instructions.md`. */
  index: string;

  /** Project-relative paths to applicable ancestor indexes. */
  parents: string[];
}

/**
 * Options used when resolving indexes for project paths.
 */
export interface ResolveIndexForPathsOptions {
  /** Project root used as the upper boundary for path and index resolution. */
  root?: string;

  /**
   * Whether to resolve only the nearest index and omit ancestor indexes.
   *
   * @defaultValue false
   */
  skipParents?: boolean;
}

interface ResolvedIndex {
  group: string;
  index: string;
}

interface PathResolution {
  nearest: ResolvedIndex | null;
  parents: string[];
}

/**
 * Normalizes an input path against the project root and ensures that it
 * remains within the project boundary.
 */
function normalizeProjectRelativePath(
  root: string,
  input: string,
): { relative: string; absolute: string } | null {
  const absolute = resolve(root, input);
  const relativePath = relative(root, absolute);

  if (relativePath === "") {
    return {
      relative: ".",
      absolute,
    };
  }

  if (
    relativePath === ".." ||
    relativePath.startsWith(`..${sep}`) ||
    relativePath.startsWith("../")
  ) {
    return null;
  }

  return {
    relative: relativePath.split(sep).join("/"),
    absolute,
  };
}

/**
 * Creates a resolver that finds the nearest index associated with a path and,
 * optionally, its ancestor indexes.
 *
 * Resolution results are cached by directory to avoid repeating filesystem
 * lookups when multiple inputs share the same location.
 */
function createIndexResolver(
  root: string,
  shouldIgnore: (path: string) => boolean,
  skipParents: boolean,
) {
  const resolutionCache = new Map<string, PathResolution | null>();
  const indexCache = new Map<string, string | null>();
  const ignoreCache = new Map<string, boolean>();

  const isIgnored = (path: string): boolean => {
    const cached = ignoreCache.get(path);

    if (cached !== undefined) {
      return cached;
    }

    const ignored = shouldIgnore(path);
    ignoreCache.set(path, ignored);

    return ignored;
  };

  /**
   * Finds the index file directly associated with a directory.
   */
  const getIndex = (directory: string): string | null => {
    const cached = indexCache.get(directory);

    if (cached !== undefined) {
      return cached;
    }

    const indexPath = resolve(directory, "index.instructions.md");

    if (!existsSync(indexPath) || isIgnored(indexPath)) {
      indexCache.set(directory, null);
      return null;
    }

    const normalizedIndex = relative(root, indexPath).split(sep).join("/") || ".";

    indexCache.set(directory, normalizedIndex);

    return normalizedIndex;
  };

  /**
   * Resolves the nearest index and, unless disabled, its ancestor indexes for
   * an absolute input path.
   */
  const resolvePath = (absoluteInput: string): PathResolution | null => {
    const startDirectory = statSync(absoluteInput).isDirectory()
      ? absoluteInput
      : dirname(absoluteInput);

    const cached = resolutionCache.get(startDirectory);

    if (cached !== undefined) {
      return cached;
    }

    let current = startDirectory;
    let nearest: ResolvedIndex | null = null;
    const parents: string[] = [];

    while (true) {
      const relativeDirectory = relative(root, current).split(sep).join("/") || ".";

      const index = getIndex(current);

      if (index) {
        if (!nearest) {
          nearest = {
            group: relativeDirectory,
            index,
          };

          if (skipParents) {
            break;
          }
        } else {
          parents.push(index);
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

    const result = nearest
      ? {
          nearest,
          parents: skipParents ? [] : parents,
        }
      : null;

    resolutionCache.set(startDirectory, result);

    return result;
  };

  return {
    isIgnored,
    resolvePath,
  };
}

/**
 * Resolves the indexes associated with one or more project paths.
 *
 * Each input is associated with the nearest `index.instructions.md` found
 * while traversing from the input's directory toward the project root.
 * Unless {@link ResolveIndexForPathsOptions.skipParents} is enabled, indexes
 * found above the nearest index are also included as parent indexes.
 *
 * Inputs that are outside the project root, ignored by Git, do not exist, or
 * have no associated index are skipped.
 *
 * Multiple inputs sharing the same nearest index are grouped together.
 *
 * @param paths - A project-relative or absolute path, or multiple paths, to
 * resolve.
 * @param options - Resolution options.
 * @returns Groups of inputs and their associated indexes, sorted by group path.
 */
export async function resolveIndexForPaths(
  paths: string | string[],
  options: ResolveIndexForPathsOptions = {},
): Promise<ResolvedIndexGroup[]> {
  const root = resolve(options.root ?? process.cwd());
  const inputPaths = Array.isArray(paths) ? paths : [paths];
  const shouldIgnore = createGitignoreChecker(root);

  const { isIgnored, resolvePath } = createIndexResolver(root, shouldIgnore, !!options.skipParents);

  const groups = new Map<string, ResolvedIndexGroup>();

  // `root` is the upper boundary for ancestor lookup.
  for (const rawInput of inputPaths) {
    const normalized = normalizeProjectRelativePath(root, rawInput);

    if (!normalized || isIgnored(normalized.absolute)) {
      continue;
    }

    if (!existsSync(normalized.absolute)) {
      continue;
    }

    const resolution = resolvePath(normalized.absolute);

    if (!resolution?.nearest) {
      continue;
    }

    const { nearest, parents } = resolution;

    const previous = groups.get(nearest.group);

    if (previous) {
      previous.inputs.push(normalized.relative);
      previous.index = nearest.index;

      if (!options.skipParents) {
        previous.parents.push(...parents);
      }

      continue;
    }

    groups.set(nearest.group, {
      group: nearest.group,
      inputs: [normalized.relative],
      index: nearest.index,
      parents: options.skipParents ? [] : parents,
    });
  }

  const result = [...groups.values()];

  for (const group of result) {
    group.inputs = [...new Set(group.inputs)].toSorted((left, right) => left.localeCompare(right));
    group.parents = [...new Set(group.parents)];
  }

  return result.toSorted((left, right) => left.group.localeCompare(right.group));
}

/**
 * Resolves the indexes associated with one or more project paths.
 *
 * @deprecated Use {@link resolveIndexForPaths} instead.
 */
export const resolveAssociatedIndexes = resolveIndexForPaths;

/**
 * Resolves the index associated with a single project path.
 *
 * This is a convenience wrapper around {@link resolveIndexForPaths}. It
 * returns the first matching group, or `null` when the path has no associated
 * index.
 *
 * @param path - A project-relative or absolute path to resolve.
 * @param options - Resolution options.
 * @returns The resolved index group, or `null` if no index is associated.
 */
export async function resolveIndexForPath(
  path: string,
  options: ResolveIndexForPathsOptions = {},
): Promise<ResolvedIndexGroup | null> {
  const result = await resolveIndexForPaths([path], options);

  return result[0] ?? null;
}
