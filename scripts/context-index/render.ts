import type { TreeNode, ContextTreeJSONNode, ContextTreeJSONRoot } from "./types";

interface RenderOptions {
  /** Maximo caracteres para descripción (default: 60) */
  descriptionMaxLength?: number;
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

      lines.push(`${prefix}${connector}${node.path}${displayDesc}`);

      prefix = nextPrefix;
    }

    const children = Array.from(node.children.values()).toSorted((a, b) =>
      a.path.localeCompare(b.path),
    );

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
  const flat = Array.from(collectAllNodes(root)).filter((n) => n.depth > 0);
  const lines = flat.map((n) => {
    const desc = n.description ? ` — ${n.description}` : "";
    return `${n.path}${desc}`;
  });

  return lines.join("\n");
}

/**
 * Render tree with markdown formatting for file output
 */
export function renderTreeToMarkdown(root: TreeNode, title: string = "Context Index"): string {
  const lines: string[] = [];

  lines.push(`# ${title}\n`);
  lines.push("## Directory Structure\n");
  lines.push("```");
  lines.push(renderTreeToString(root));
  lines.push("```\n");

  lines.push("## Details\n");

  const allNodes = Array.from(collectAllNodes(root))
    .filter((n) => n.depth > 0)
    .toSorted((a, b) => a.path.localeCompare(b.path));

  for (const node of allNodes) {
    if (node.description) {
      lines.push(`### \`${node.path}\`\n`);
      lines.push(`${node.description}\n`);
    }
  }

  return lines.join("\n");
}

/**
 * Convert tree node to JSON representation recursively
 */
function nodeToJSONNode(node: TreeNode): ContextTreeJSONNode {
  const children = Array.from(node.children.values()).toSorted((a, b) =>
    a.path.localeCompare(b.path),
  );

  return {
    path: node.path,
    description: node.description,
    children: children.length > 0 ? children.map((c) => nodeToJSONNode(c)) : undefined,
  };
}

function nodeToJSONRoot(node: TreeNode): ContextTreeJSONRoot {
  const children = Array.from(node.children.values()).toSorted((a, b) =>
    a.path.localeCompare(b.path),
  );

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

/**
 * Collect all nodes from tree
 */
function* collectAllNodes(node: TreeNode): Generator<TreeNode> {
  yield node;
  for (const child of node.children.values()) {
    yield* collectAllNodes(child);
  }
}
