export interface ContextIndexEntry {
  /** Relative path to the index.instructions.md file */
  filePath: string;
  /** Path to the containing directory */
  folderPath: string;
  /** Description extracted from the YAML header */
  description: string;
  /** Full document body content */
  bodyContent: string;
  /** Depth level (useful for displaying hierarchy) */
  depth: number;
}

export interface TreeNode {
  /** Directory name */
  name: string;
  /** Description of this directory */
  description: string;
  /** Full relative path */
  path: string;
  /** Depth in the tree */
  depth: number;
  /** Child nodes indexed by name */
  children: Map<string, TreeNode>;
}

/**
 * JSON representation of a tree node returned by `renderTreeToJSON`
 */
export interface ContextTreeJSONNode {
  path?: string;
  description: string;
  children?: ContextTreeJSONNode[];
}

export interface ContextTreeJSONRoot {
  root: {
    description: string;
    children: ContextTreeJSONNode[];
  };
}
