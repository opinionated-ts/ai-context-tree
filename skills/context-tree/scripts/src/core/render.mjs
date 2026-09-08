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
export { renderTreeToCompactString, renderTreeToJSON, renderTreeToString };
