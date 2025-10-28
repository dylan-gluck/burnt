/**
 * Unit tests for createRenderTree function
 * Tests the creation and initialization of render trees with root nodes
 */

import { describe, expect, test } from "bun:test";
import { createRenderTree, NodeType } from "../../src/types/nodes";

describe("createRenderTree", () => {
	test("creates a valid render tree with root node", () => {
		const tree = createRenderTree();

		expect(tree.root.type).toBe(NodeType.ROOT);
		expect(tree.root.children).toEqual([]);
		expect(tree.root.parent).toBeNull();
		expect(tree.version).toBe(0);
		expect(tree.nodeMap.size).toBe(1);
		expect(tree.dirtyNodes.size).toBe(0);
	});

	test("root node has valid metadata", () => {
		const tree = createRenderTree();

		expect(tree.root.metadata).toMatchObject({
			key: null,
			fiberNode: null,
			mounted: false,
			needsLayout: false,
			needsRender: false,
		});
	});

	test("generates unique IDs for multiple trees", () => {
		const tree1 = createRenderTree();
		const tree2 = createRenderTree();

		expect(tree1.root.id).not.toBe(tree2.root.id);
	});
});
