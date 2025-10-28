/**
 * Tests for Specific RenderNode Schemas
 *
 * Tests validation of individual node types: Root, Text, Box, Newline, Spacer, Static, Transform.
 */

import { describe, expect, test } from "bun:test";
import {
	decodeBoxNode,
	decodeNewlineNode,
	decodeRootNode,
	decodeSpacerNode,
	decodeStaticNode,
	decodeTextNode,
	decodeTransformNode,
} from "../../schemas/nodes.js";

// Helper to create minimal valid metadata for testing
const createMinimalMetadata = () => ({
	key: null,
	fiberNode: null,
	mounted: false,
	needsLayout: false,
	needsRender: false,
});

describe("RootNodeSchema", () => {
	test("accepts valid root node", () => {
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
		expect(() => decodeRootNode(node)).not.toThrow();
	});
});

describe("TextNodeSchema", () => {
	test("accepts valid text node", () => {
		const node = {
			id: "text-1",
			type: "text",
			props: { color: "red" },
			textContent: "Hello",
			styledContent: [],
			children: [],
			parent: null,
			layoutInfo: null,
			yogaNode: null,
			metadata: createMinimalMetadata(),
		};
		expect(() => decodeTextNode(node)).not.toThrow();
	});

	test("rejects text node missing textContent", () => {
		const node = {
			id: "text-1",
			type: "text",
			props: {},
			styledContent: [],
			children: [],
			parent: null,
			layoutInfo: null,
			yogaNode: null,
			metadata: createMinimalMetadata(),
		};
		expect(() => decodeTextNode(node)).toThrow();
	});
});

describe("BoxNodeSchema", () => {
	test("accepts valid box node", () => {
		const node = {
			id: "box-1",
			type: "box",
			props: { flexDirection: "column" },
			children: [],
			parent: null,
			layoutInfo: null,
			yogaNode: null,
			metadata: createMinimalMetadata(),
		};
		expect(() => decodeBoxNode(node)).not.toThrow();
	});
});

describe("NewlineNodeSchema", () => {
	test("accepts valid newline node", () => {
		const node = {
			id: "newline-1",
			type: "newline",
			props: {},
			count: 1,
			children: [],
			parent: null,
			layoutInfo: null,
			yogaNode: null,
			metadata: createMinimalMetadata(),
		};
		expect(() => decodeNewlineNode(node)).not.toThrow();
	});

	test("accepts newline node with count > 1", () => {
		const node = {
			id: "newline-1",
			type: "newline",
			props: {},
			count: 3,
			children: [],
			parent: null,
			layoutInfo: null,
			yogaNode: null,
			metadata: createMinimalMetadata(),
		};
		expect(() => decodeNewlineNode(node)).not.toThrow();
	});

	test("rejects newline node with count = 0", () => {
		const node = {
			id: "newline-1",
			type: "newline",
			props: {},
			count: 0,
			children: [],
			parent: null,
			layoutInfo: null,
			yogaNode: null,
			metadata: createMinimalMetadata(),
		};
		expect(() => decodeNewlineNode(node)).toThrow();
	});

	test("rejects newline node with negative count", () => {
		const node = {
			id: "newline-1",
			type: "newline",
			props: {},
			count: -1,
			children: [],
			parent: null,
			layoutInfo: null,
			yogaNode: null,
			metadata: createMinimalMetadata(),
		};
		expect(() => decodeNewlineNode(node)).toThrow();
	});
});

describe("SpacerNodeSchema", () => {
	test("accepts valid spacer node", () => {
		const node = {
			id: "spacer-1",
			type: "spacer",
			props: {},
			children: [],
			parent: null,
			layoutInfo: null,
			yogaNode: null,
			metadata: createMinimalMetadata(),
		};
		expect(() => decodeSpacerNode(node)).not.toThrow();
	});
});

describe("StaticNodeSchema", () => {
	test("accepts valid static node", () => {
		const node = {
			id: "static-1",
			type: "static",
			props: { items: [], children: () => null },
			frozenContent: "Frozen",
			children: [],
			parent: null,
			layoutInfo: null,
			yogaNode: null,
			metadata: createMinimalMetadata(),
		};
		expect(() => decodeStaticNode(node)).not.toThrow();
	});
});

describe("TransformNodeSchema", () => {
	test("accepts valid transform node", () => {
		const node = {
			id: "transform-1",
			type: "transform",
			props: { transform: (s: string) => s, children: null },
			transformedContent: "Transformed",
			children: [],
			parent: null,
			layoutInfo: null,
			yogaNode: null,
			metadata: createMinimalMetadata(),
		};
		expect(() => decodeTransformNode(node)).not.toThrow();
	});
});
