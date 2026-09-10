import type { ContextIndexEntry, TreeNode } from "@/types";

function getSortedChildren(node: TreeNode): TreeNode[] {
  return Array.from(node.children.values()).toSorted((a, b) => a.path.localeCompare(b.path));
}

/**
 * Build hierarchical tree structure from flat list of index files
 */
export function buildContextTree(entries: ContextIndexEntry[]): TreeNode {
  const root: TreeNode = {
    name: "root",
    description: "Project root",
    path: ".",
    depth: 0,
    children: new Map(),
  };

  // Sort entries by path segments for proper tree building
  const sorted = entries.toSorted((a, b) => a.folderPath.localeCompare(b.folderPath));

  for (const entry of sorted) {
    const parts = entry.folderPath === "." ? [] : entry.folderPath.split("/");
    let currentNode = root;

    // Navigate/create path to parent node
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (!part) {
        continue;
      }

      if (!currentNode.children.has(part)) {
        const newDepth = i + 1;
        const pathSoFar = parts.slice(0, i + 1).join("/");

        currentNode.children.set(part, {
          name: part,
          description: "",
          path: pathSoFar,
          depth: newDepth,
          children: new Map(),
        });
      }

      const nextNode = currentNode.children.get(part);
      if (nextNode) {
        currentNode = nextNode;
      }
    }

    // Update description at the node level
    currentNode.description = entry.description;
  }

  return root;
}

/**
 * Get flat list of all nodes in order (depth-first traversal)
 */
export function flattenTree(node: TreeNode): TreeNode[] {
  const result: TreeNode[] = [node];

  for (const child of getSortedChildren(node)) {
    result.push(...flattenTree(child));
  }

  return result;
}

/**
 * Find node by path in tree
 */
export function findNodeByPath(node: TreeNode, path: string): TreeNode | null {
  if (node.path === path) {
    return node;
  }

  for (const child of getSortedChildren(node)) {
    const found = findNodeByPath(child, path);
    if (found) {
      return found;
    }
  }

  return null;
}

/**
 * Get all direct children of a node
 */
export function getChildren(node: TreeNode): TreeNode[] {
  return getSortedChildren(node);
}
