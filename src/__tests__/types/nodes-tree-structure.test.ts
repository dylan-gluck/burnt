/**
 * Unit tests for RenderTree structure
 * Tests the structure and manipulation of render trees including nodeMap and dirtyNodes
 */

import { describe, expect, test } from "bun:test";
import { createNode, createRenderTree, NodeType } from "../../types/nodes";

describe("RenderTree Structure", () => {
	test("RenderTree has all required properties and correct types", () => {
		const tree = createRenderTree();

		expect(tree).toHaveProperty("root");
		expect(tree).toHaveProperty("nodeMap");
		expect(tree).toHaveProperty("dirtyNodes");
		expect(tree).toHaveProperty("version");
		expect(tree.nodeMap instanceof Map).toBe(true);
		expect(tree.dirtyNodes instanceof Set).toBe(true);
	});

	test("can add nodes to tree nodeMap and dirtyNodes", () => {
		const tree = createRenderTree();
		const textNode = createNode(NodeType.TEXT);

		tree.nodeMap.set(textNode.id, textNode);
		tree.dirtyNodes.add(textNode.id);

		expect(tree.nodeMap.get(textNode.id)).toBe(textNode);
		expect(tree.nodeMap.size).toBe(2); // root + text
		expect(tree.dirtyNodes.has(textNode.id)).toBe(true);
		expect(tree.dirtyNodes.size).toBe(1);
	});
});
