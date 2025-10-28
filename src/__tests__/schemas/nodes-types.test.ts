/**
 * Tests for NodeType Schema
 *
 * Tests validation of node type literals.
 */

import { describe, expect, test } from "bun:test";
import { decodeNodeType } from "../../schemas/nodes.js";

describe("NodeTypeSchema", () => {
	test("accepts all valid node types", () => {
		const validTypes = [
			"root",
			"text",
			"box",
			"newline",
			"spacer",
			"static",
			"transform",
		];
		for (const type of validTypes) {
			expect(() => decodeNodeType(type)).not.toThrow();
		}
	});

	test("rejects invalid node type", () => {
		expect(() => decodeNodeType("invalid")).toThrow();
	});
});
