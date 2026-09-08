import { createGitignoreChecker } from "./gitignore.mjs";
import { readFileSync, readdirSync, statSync } from "fs";
import { relative, resolve } from "path";
//#region src/core/parse.ts
/**
* Parse index.instructions.md file and extract description and body
*/
function parseIndexFile(filePath) {
	const content = readFileSync(filePath, "utf-8");
	const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
	if (!frontmatterMatch) return {
		description: "",
		body: content
	};
	const frontmatter = frontmatterMatch?.[1] ?? "";
	const body = frontmatterMatch?.[2] ?? content;
	return {
		description: (frontmatter.match(/description:\s*['""]?([^'"\n]*)['""]?/)?.[1] ?? "").trim(),
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
export { findIndexFiles, parseIndexFile };
