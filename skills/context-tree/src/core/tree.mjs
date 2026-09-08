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
export { buildContextTree };
