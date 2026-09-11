import type { TreeNode, ContextTreeJSONNode, ContextTreeJSONRoot } from "@/types";

import type { ResolvedIndexGroup } from "./file";

interface RenderOptions {
  /** Maximo caracteres para descripción (default: 60) */
  descriptionMaxLength?: number;
}

export function renderIndexForText(results: ResolvedIndexGroup[]): string {
  if (results.length === 0) {
    return "No associated index files found.";
  }

  return results
    .map((group) => {
      const lines = [
        `group: ${group.group}`,
        `inputs: ${group.inputs.length > 0 ? group.inputs.join(", ") : "-"}`,
        `index: ${group.index || "-"}`,
      ];

      if (group.parents.length > 0) {
        lines.push(`parents: ${group.parents.join(", ")}`);
      }

      return lines.join("\n");
    })
    .join("\n\n");
}

function getOrderedChildren(node: TreeNode): IterableIterator<TreeNode> {
  return node.children.values();
}

function getNodeName(node: TreeNode): string {
  const lastSeparator = node.path.lastIndexOf("/");
  return lastSeparator >= 0 ? node.path.slice(lastSeparator + 1) : node.path;
}

/**
 * Render tree to ASCII art format suitable for terminal display
 */
export function renderTreeToString(root: TreeNode, options: RenderOptions = {}): string {
  const { descriptionMaxLength = 1024 } = options;

  const lines: string[] = [];

  function renderNode(node: TreeNode, prefix: string = "", isLast: boolean = true): void {
    // Skip root node in output
    if (node.depth > 0) {
      const connector = isLast ? "└── " : "├── ";
      const nextPrefix = prefix + (isLast ? "    " : "│   ");

      const desc = node.description
        ? node.description.length > descriptionMaxLength
          ? `${node.description.substring(0, descriptionMaxLength)}...`
          : node.description
        : "";
      const displayDesc = desc ? ` — ${desc}` : "";
      const name = getNodeName(node);

      lines.push(`${prefix}${connector}${name}${displayDesc}`);

      prefix = nextPrefix;
    }

    const children = Array.from(getOrderedChildren(node));

    for (let i = 0; i < children.length; i++) {
      const isLastChild = i === children.length - 1;
      renderNode(children[i]!, prefix, isLastChild);
    }
  }

  renderNode(root);
  return lines.join("\n");
}

/**
 * Render tree as a single compact line per entry, keeping the inline description
 * when available.
 */
export function renderTreeToCompactString(root: TreeNode): string {
  const lines: string[] = [];

  function visit(node: TreeNode): void {
    if (node.depth > 0 && node.description) {
      lines.push(`${node.path} — ${node.description.trim()}`);
    }

    for (const child of getOrderedChildren(node)) {
      visit(child);
    }
  }

  visit(root);
  return lines.join("\n");
}

/**
 * Convert tree node to JSON representation recursively
 */
function nodeToJSONNode(node: TreeNode): ContextTreeJSONNode {
  const children = Array.from(getOrderedChildren(node));

  return {
    path: node.path,
    description: node.description,
    children: children.length > 0 ? children.map((c) => nodeToJSONNode(c)) : undefined,
  };
}

function nodeToJSONRoot(node: TreeNode): ContextTreeJSONRoot {
  const children = Array.from(getOrderedChildren(node));

  return {
    root: {
      description: node.description,
      children: children.map((c) => nodeToJSONNode(c)),
    },
  };
}

/**
 * Render tree as JSON structure
 */
export function renderTreeToJSON(root: TreeNode): ContextTreeJSONRoot {
  return nodeToJSONRoot(root);
}
