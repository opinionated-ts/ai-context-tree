import { n as defineCommand, r as runMain, t as require_dist } from "./node_modules.mjs";
import { readFileSync, readdirSync, statSync } from "fs";
import { relative, resolve } from "path";
//#region src/core/gitignore.ts
var import_dist = require_dist();
/**
* Parse .gitignore and return function to check if path should be ignored
*/
async function createGitignoreChecker(rootPath) {
	const gitignorePath = resolve(rootPath, ".gitignore");
	let patterns = [];
	try {
		patterns = readFileSync(gitignorePath, "utf-8").split("\n").map((line) => line.trim()).filter((line) => line && !line.startsWith("#"));
	} catch {
		return () => false;
	}
	return (filePath) => {
		const relativePath = relative(rootPath, filePath);
		for (const pattern of patterns) {
			if (simpleGlobMatch(relativePath, pattern)) return true;
			const parts = relativePath.split("/");
			for (let i = 0; i < parts.length; i++) if (simpleGlobMatch(parts.slice(0, i + 1).join("/"), pattern)) return true;
		}
		return false;
	};
}
/**
* Simple glob matching for common patterns
*/
function simpleGlobMatch(path, pattern) {
	pattern = pattern.replace(/\/$/, "");
	if (path === pattern) return true;
	if (path.includes(`/${pattern}/`) || path.startsWith(`${pattern}/`)) return true;
	if (pattern === "*" || pattern === "**/") return true;
	if (pattern.startsWith("*.")) {
		const ext = pattern.substring(1);
		if (path.endsWith(ext)) return true;
	}
	if (pattern.includes("**")) {
		const parts = pattern.split("**");
		if (parts.length === 2) {
			const before = parts[0];
			const after = parts[1];
			const beforePattern = before?.replace(/\/$/, "") ?? "";
			const afterPattern = after?.replace(/^\//, "") ?? "";
			if (!beforePattern || beforePattern === "") {
				if (afterPattern === "") return true;
				return path.includes(afterPattern) || path.endsWith(afterPattern);
			}
			if (beforePattern && path.startsWith(beforePattern)) {
				if (!afterPattern || afterPattern === "") return true;
				const remaining = path.substring(beforePattern.length + 1);
				return remaining.includes(afterPattern) || remaining.endsWith(afterPattern);
			}
		}
	}
	return false;
}
//#endregion
//#region src/core/parse.ts
/**
* Parse index.instructions.md file and extract description and body
*/
function parseIndexFile(filePath) {
	const content = readFileSync(filePath, "utf-8");
	const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
	if (!match) return {
		description: "",
		body: content
	};
	const [, frontmatter = "", body = ""] = match;
	const metadata = (0, import_dist.parse)(frontmatter);
	return {
		description: typeof metadata?.description === "string" ? metadata.description.trim() : "",
		body: body.trim()
	};
}
/**
* Recursively find all index.instructions.md files respecting .gitignore
*/
async function findIndexFiles(root, options) {
	const maxDepth = options?.maxDepth ?? Infinity;
	const shouldIgnore = await createGitignoreChecker(root);
	const results = [];
	async function traverse(dir, currentDepth = 0) {
		if (currentDepth > maxDepth) return;
		let entries;
		try {
			entries = readdirSync(dir);
		} catch {
			return;
		}
		const subDirectories = [];
		for (const entry of entries) {
			const fullPath = resolve(dir, entry);
			if (shouldIgnore(fullPath)) continue;
			try {
				if (statSync(fullPath).isDirectory()) subDirectories.push(fullPath);
				else if (entry === "index.instructions.md") {
					const relativeFolderPath = relative(root, dir);
					const { description, body } = parseIndexFile(fullPath);
					results.push({
						filePath: relative(root, fullPath),
						folderPath: relativeFolderPath || ".",
						description,
						bodyContent: body,
						depth: currentDepth
					});
				}
			} catch {
				continue;
			}
		}
		await Promise.all(subDirectories.map((subDir) => traverse(subDir, currentDepth + 1)));
	}
	await traverse(root);
	return results.toSorted((a, b) => a.filePath.localeCompare(b.filePath));
}
//#endregion
//#region src/core/render.ts
/**
* Render tree to ASCII art format suitable for terminal display
*/
function renderTreeToString(root, options = {}) {
	const { descriptionMaxLength = 1024 } = options;
	const lines = [];
	function renderNode(node, prefix = "", isLast = true) {
		if (node.depth > 0) {
			const connector = isLast ? "└── " : "├── ";
			const nextPrefix = prefix + (isLast ? "    " : "│   ");
			const desc = node.description ? node.description.length > descriptionMaxLength ? `${node.description.substring(0, descriptionMaxLength)}...` : node.description : "";
			const displayDesc = desc ? ` — ${desc}` : "";
			const name = node.path.split("/").pop() ?? node.path;
			lines.push(`${prefix}${connector}${name}${displayDesc}`);
			prefix = nextPrefix;
		}
		const children = Array.from(node.children.values()).toSorted((a, b) => a.path.localeCompare(b.path));
		for (let i = 0; i < children.length; i++) {
			const isLastChild = i === children.length - 1;
			renderNode(children[i], prefix, isLastChild);
		}
	}
	renderNode(root);
	return lines.join("\n");
}
/**
* Render tree as a single compact line per entry, keeping the inline description
* when available.
*/
function renderTreeToCompactString(root) {
	return Array.from(collectAllNodes(root)).filter((n) => n.depth > 0).map((n) => {
		const desc = n.description ? ` — ${n.description}` : "";
		return `${n.path}${desc}`;
	}).join("\n");
}
/**
* Convert tree node to JSON representation recursively
*/
function nodeToJSONNode(node) {
	const children = Array.from(node.children.values()).toSorted((a, b) => a.path.localeCompare(b.path));
	return {
		path: node.path,
		description: node.description,
		children: children.length > 0 ? children.map((c) => nodeToJSONNode(c)) : void 0
	};
}
function nodeToJSONRoot(node) {
	const children = Array.from(node.children.values()).toSorted((a, b) => a.path.localeCompare(b.path));
	return { root: {
		description: node.description,
		children: children.map((c) => nodeToJSONNode(c))
	} };
}
/**
* Render tree as JSON structure
*/
function renderTreeToJSON(root) {
	return nodeToJSONRoot(root);
}
/**
* Collect all nodes from tree
*/
function* collectAllNodes(node) {
	yield node;
	for (const child of node.children.values()) yield* collectAllNodes(child);
}
//#endregion
//#region src/core/tree.ts
/**
* Build hierarchical tree structure from flat list of index files
*/
function buildContextTree(entries) {
	const root = {
		name: "root",
		description: "Project root",
		path: ".",
		depth: 0,
		children: /* @__PURE__ */ new Map()
	};
	const sorted = entries.toSorted((a, b) => a.folderPath.localeCompare(b.folderPath));
	for (const entry of sorted) {
		const parts = entry.folderPath === "." ? [] : entry.folderPath.split("/");
		let currentNode = root;
		for (let i = 0; i < parts.length; i++) {
			const part = parts[i];
			if (!part) continue;
			if (!currentNode.children.has(part)) {
				const newDepth = i + 1;
				const pathSoFar = parts.slice(0, i + 1).join("/");
				currentNode.children.set(part, {
					name: part,
					description: "",
					path: pathSoFar,
					depth: newDepth,
					children: /* @__PURE__ */ new Map()
				});
			}
			const nextNode = currentNode.children.get(part);
			if (nextNode) currentNode = nextNode;
		}
		currentNode.description = entry.description;
	}
	return root;
}
//#endregion
//#region src/core/index.ts
async function generateContextTree(options) {
	const root = options?.root ?? process.cwd();
	const maxDepth = options?.depth;
	const tree = buildContextTree(await findIndexFiles(root, { maxDepth }));
	const format = options?.format ?? "json";
	if (format === "json") return renderTreeToJSON(tree);
	if (format === "compact-tree") return renderTreeToCompactString(tree);
	return renderTreeToString(tree);
}
//#endregion
//#region src/core/cli.ts
/**
* Main CLI entry point for the context index system.
*
* Scans the project for `index.instructions.md` files, builds a
* hierarchical tree, and renders it to the terminal or exports it.
*/
const main = defineCommand({
	meta: {
		name: "ai-context-tree",
		description: "Build a context tree from index.instructions.md files"
	},
	args: {
		format: {
			type: "enum",
			alias: "f",
			options: [
				"tree",
				"json",
				"compact-tree"
			],
			default: "tree",
			description: "Output format for the generated context tree"
		},
		root: {
			type: "string",
			alias: "r",
			valueHint: "path",
			default: process.cwd(),
			description: "Root directory to scan (default: current directory)"
		},
		depth: {
			type: "string",
			alias: "d",
			default: "10",
			valueHint: "number",
			description: "Maximum directory depth to scan"
		}
	},
	async run({ args }) {
		const root = args.root;
		const maxDepth = Number.parseInt(args.depth);
		const format = args.format;
		const prefix = "\x1B[36m[ai-context-tree]\x1B[0m";
		const path = `\x1b[33m${root}\x1b[0m`;
		const count = `\x1b[32m${(await findIndexFiles(root, { maxDepth })).length}\x1b[0m`;
		if (format !== "json") {
			console.info(`${prefix} Searching in: ${path}`);
			console.info(`${prefix} Found ${count} index files`);
		}
		const treeOutput = await generateContextTree({
			root,
			format,
			depth: maxDepth
		});
		if (typeof treeOutput === "string") console.log("\n" + treeOutput);
		else console.log(JSON.stringify(treeOutput, null, 2));
	}
});
runMain(main);
//#endregion
export {};
