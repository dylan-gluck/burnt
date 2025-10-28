/**
 * Unit tests for createNode function
 * Tests node creation with default values, unique IDs, and proper initialization
 */

import { describe, expect, test } from "bun:test";
import { createNode, NodeType } from "../../src/types/nodes";

describe("createNode", () => {
	test.each([
		[NodeType.ROOT, { children: [], props: {} }],
		[NodeType.TEXT, { textContent: "", styledContent: [], props: {} }],
		[NodeType.BOX, { props: {} }],
		[NodeType.NEWLINE, { count: 1 }],
		[NodeType.SPACER, {}],
		[NodeType.STATIC, { frozenContent: "" }],
		[NodeType.TRANSFORM, { transformedContent: "" }],
	])("creates %s node with default values", (type, expectedProps) => {
		const node = createNode(type);

		expect(node.type).toBe(type);
		expect(node).toMatchObject(expectedProps);
	});

	test("all created nodes have unique IDs", () => {
		const nodes = [
			createNode(NodeType.ROOT),
			createNode(NodeType.TEXT),
			createNode(NodeType.BOX),
		];

		const uniqueIds = new Set(nodes.map((n) => n.id));
		expect(uniqueIds.size).toBe(nodes.length);
	});

	test("all created nodes have null layout info and initialized metadata", () => {
		const node = createNode(NodeType.BOX);

		expect(node.layoutInfo).toBeNull();
		expect(node.yogaNode).toBeNull();
		expect(node.metadata.mounted).toBe(false);
		expect(node.metadata.needsLayout).toBe(false);
		expect(node.metadata.needsRender).toBe(false);
	});
});
