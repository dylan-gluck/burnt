/**
 * Tests for RenderNode Union Schema
 *
 * Tests validation of the discriminated union of all render node types.
 */

import { describe, expect, test } from "bun:test";
import { decodeRenderNode } from "../../schemas/nodes.js";

// Helper to create minimal valid metadata for testing
const createMinimalMetadata = () => ({
	key: null,
	fiberNode: null,
	mounted: false,
	needsLayout: false,
	needsRender: false,
});

describe("RenderNodeSchema (Union)", () => {
	test("accepts root node via union", () => {
		const node = {
			id: "root-1",
			type: "root",
			props: {},
			children: [],
			parent: null,
			layoutInfo: null,
			yogaNode: null,
			metadata: createMinimalMetadata(),
		};
		expect(() => decodeRenderNode(node)).not.toThrow();
	});

	test("accepts text node via union", () => {
		const node = {
			id: "text-1",
			type: "text",
			props: {},
			textContent: "Hello",
			styledContent: [],
			children: [],
			parent: null,
			layoutInfo: null,
			yogaNode: null,
			metadata: createMinimalMetadata(),
		};
		expect(() => decodeRenderNode(node)).not.toThrow();
	});

	test("accepts box node via union", () => {
		const node = {
			id: "box-1",
			type: "box",
			props: {},
			children: [],
			parent: null,
			layoutInfo: null,
			yogaNode: null,
			metadata: createMinimalMetadata(),
		};
		expect(() => decodeRenderNode(node)).not.toThrow();
	});

	test("rejects invalid node type", () => {
		const node = {
			id: "invalid-1",
			type: "invalid",
			props: {},
			children: [],
			parent: null,
			layoutInfo: null,
			yogaNode: null,
			metadata: createMinimalMetadata(),
		};
		expect(() => decodeRenderNode(node)).toThrow();
	});
});
