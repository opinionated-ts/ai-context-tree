import { findIndexFiles } from "./parse.mjs";
import { renderTreeToCompactString, renderTreeToJSON, renderTreeToString } from "./render.mjs";
import { buildContextTree } from "./tree.mjs";
//#region src/core/index.ts
async function generateContextTree(options) {
	const root = options?.root ?? process.cwd();
	const maxDepth = options?.depth;
	const entries = await findIndexFiles(root, { maxDepth });
	const tree = buildContextTree(entries);
	const format = options?.format ?? "json";
	if (format === "json") return renderTreeToJSON(tree);
	if (format === "compact-tree") return renderTreeToCompactString(tree);
	return renderTreeToString(tree);
}
//#endregion
export { generateContextTree as default, generateContextTree };
