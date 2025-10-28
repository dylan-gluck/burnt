/**
 * Unit tests for node structure validation
 * Tests that nodes have correct base and type-specific properties
 */

import { describe, expect, test } from "bun:test";
import { createNode, NodeType } from "../../types/nodes";

// Base properties that all nodes must have
const baseNodeProperties = [
	"id",
	"type",
	"children",
	"parent",
	"layoutInfo",
	"yogaNode",
	"metadata",
];

describe("Node Structure", () => {
	test.each([
		[NodeType.TEXT, ["textContent", "styledContent", "props"]],
		[NodeType.BOX, ["props"]],
		[NodeType.NEWLINE, ["count"]],
		[NodeType.STATIC, ["frozenContent"]],
		[NodeType.TRANSFORM, ["transformedContent"]],
	])("%s has correct structure", (type, additionalProps) => {
		const node = createNode(type);

		// All nodes have base properties
		for (const prop of baseNodeProperties) {
			expect(node).toHaveProperty(prop);
		}

		// Check type-specific properties
		for (const prop of additionalProps) {
			expect(node).toHaveProperty(prop);
		}
	});
});
