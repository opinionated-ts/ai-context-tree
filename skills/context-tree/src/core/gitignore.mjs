import { readFileSync } from "fs";
import { relative, resolve } from "path";
//#region src/core/gitignore.ts
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
export { createGitignoreChecker };
