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

export interface CLIOptions {
  /** Raíz desde donde buscar (default: cwd) */
  root: string;
  /** Profundidad máxima (default: Infinity) */
  depth?: number;
  /** Formato de exportación: 'markdown' | 'json' */
  export?: string;
  /** Usar caché si existe */
  useCache?: boolean;
}
