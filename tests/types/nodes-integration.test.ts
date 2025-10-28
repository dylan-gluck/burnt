/**
 * Integration tests for render nodes
 * Tests complex scenarios involving tree structure building and node type discrimination
 */

import { describe, expect, test } from "bun:test";
import {
	createNode,
	createRenderTree,
	NodeType,
	type RenderNode,
} from "../../src/types/nodes";

describe("Integration", () => {
	test("can create tree structure and mark nodes as dirty", () => {
		const tree = createRenderTree();
		const boxNode = createNode(NodeType.BOX);
		const textNode = createNode(NodeType.TEXT);

		// Build tree structure
		tree.root.children = [boxNode];
		boxNode.parent = tree.root;
		boxNode.children = [textNode];
		textNode.parent = boxNode;
		tree.nodeMap.set(boxNode.id, boxNode);
		tree.nodeMap.set(textNode.id, textNode);

		expect(tree.nodeMap.size).toBe(3); // root + box + text
		expect(tree.root.children[0]).toBe(boxNode);
		expect(boxNode.children[0]).toBe(textNode);

		// Mark nodes as dirty
		tree.dirtyNodes.add(boxNode.id);
		tree.dirtyNodes.add(textNode.id);
		expect(tree.dirtyNodes.size).toBe(2);
		expect(tree.dirtyNodes.has(boxNode.id)).toBe(true);
	});

	test("node type discriminator works correctly", () => {
		const allTypes = [
			NodeType.ROOT,
			NodeType.TEXT,
			NodeType.BOX,
			NodeType.NEWLINE,
			NodeType.SPACER,
			NodeType.STATIC,
			NodeType.TRANSFORM,
		];
		const nodes: RenderNode[] = allTypes.map(createNode);
		expect(nodes.map((n) => n.type)).toEqual(allTypes);
	});
});
