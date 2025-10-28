/**
 * Tests for Render Node Schemas
 *
 * Tests validation of node types, metadata, layout info, and render node unions.
 */

import { describe, expect, test } from "bun:test";
import {
	decodeBoxNode,
	decodeLayoutInfo,
	decodeNewlineNode,
	decodeNodeMetadata,
	decodeNodeType,
	decodeRenderNode,
	decodeRootNode,
	decodeSpacerNode,
	decodeStaticNode,
	decodeStyledText,
	decodeTextNode,
	decodeTextStyle,
	decodeTransformNode,
	decodeYogaNode,
} from "../../schemas/nodes.js";

// ============================================================================
// NodeType Schema Tests
// ============================================================================

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

// ============================================================================
// LayoutInfo Schema Tests
// ============================================================================

describe("LayoutInfoSchema", () => {
	test("accepts valid layout info", () => {
		const layout = {
			x: 10,
			y: 20,
			width: 100,
			height: 50,
			left: 5,
			top: 10,
		};
		expect(() => decodeLayoutInfo(layout)).not.toThrow();
	});

	test("accepts zero dimensions", () => {
		const layout = {
			x: 0,
			y: 0,
			width: 0,
			height: 0,
			left: 0,
			top: 0,
		};
		expect(() => decodeLayoutInfo(layout)).not.toThrow();
	});

	test("rejects negative width", () => {
		const layout = {
			x: 0,
			y: 0,
			width: -10,
			height: 50,
			left: 0,
			top: 0,
		};
		expect(() => decodeLayoutInfo(layout)).toThrow();
	});

	test("rejects negative height", () => {
		const layout = {
			x: 0,
			y: 0,
			width: 100,
			height: -50,
			left: 0,
			top: 0,
		};
		expect(() => decodeLayoutInfo(layout)).toThrow();
	});

	test("accepts negative x and y (positions can be negative)", () => {
		const layout = {
			x: -10,
			y: -20,
			width: 100,
			height: 50,
			left: -5,
			top: -10,
		};
		expect(() => decodeLayoutInfo(layout)).not.toThrow();
	});

	test("rejects missing fields", () => {
		const layout = {
			x: 0,
			y: 0,
			width: 100,
			// Missing height, left, top
		};
		expect(() => decodeLayoutInfo(layout)).toThrow();
	});
});

// ============================================================================
// NodeMetadata Schema Tests
// ============================================================================

describe("NodeMetadataSchema", () => {
	test("accepts valid metadata with null key", () => {
		const metadata = {
			key: null,
			fiberNode: null,
			mounted: false,
			needsLayout: false,
			needsRender: false,
		};
		expect(() => decodeNodeMetadata(metadata)).not.toThrow();
	});

	test("accepts string key", () => {
		const metadata = {
			key: "my-key",
			fiberNode: null,
			mounted: true,
			needsLayout: true,
			needsRender: true,
		};
		expect(() => decodeNodeMetadata(metadata)).not.toThrow();
	});

	test("accepts number key", () => {
		const metadata = {
			key: 123,
			fiberNode: null,
			mounted: false,
			needsLayout: false,
			needsRender: false,
		};
		expect(() => decodeNodeMetadata(metadata)).not.toThrow();
	});

	test("accepts opaque fiberNode", () => {
		const metadata = {
			key: null,
			fiberNode: { some: "data" },
			mounted: false,
			needsLayout: false,
			needsRender: false,
		};
		expect(() => decodeNodeMetadata(metadata)).not.toThrow();
	});

	test("rejects non-boolean mounted", () => {
		const metadata = {
			key: null,
			fiberNode: null,
			mounted: "yes",
			needsLayout: false,
			needsRender: false,
		};
		expect(() => decodeNodeMetadata(metadata)).toThrow();
	});

	test("rejects missing fields", () => {
		const metadata = {
			key: null,
			fiberNode: null,
			// Missing mounted, needsLayout, needsRender
		};
		expect(() => decodeNodeMetadata(metadata)).toThrow();
	});
});

// ============================================================================
// YogaNode Schema Tests
// ============================================================================

describe("YogaNodeSchema", () => {
	test("accepts valid yoga node", () => {
		const yogaNode = {
			nativeNode: {},
			id: "node-1",
			children: [],
			computed: false,
		};
		expect(() => decodeYogaNode(yogaNode)).not.toThrow();
	});

	test("accepts yoga node with children", () => {
		const yogaNode = {
			nativeNode: {},
			id: "node-1",
			children: [
				{ nativeNode: {}, id: "child-1", children: [], computed: true },
			],
			computed: true,
		};
		expect(() => decodeYogaNode(yogaNode)).not.toThrow();
	});
});

// ============================================================================
// StyledText Schema Tests
// ============================================================================

describe("TextStyleSchema", () => {
	test("accepts valid text style with all flags false", () => {
		const style = {
			bold: false,
			italic: false,
			underline: false,
			strikethrough: false,
			inverse: false,
			dim: false,
		};
		expect(() => decodeTextStyle(style)).not.toThrow();
	});

	test("accepts text style with foreground color", () => {
		const style = {
			foreground: { r: 255, g: 0, b: 0 },
			bold: true,
			italic: false,
			underline: false,
			strikethrough: false,
			inverse: false,
			dim: false,
		};
		expect(() => decodeTextStyle(style)).not.toThrow();
	});

	test("accepts text style with background color", () => {
		const style = {
			background: { r: 0, g: 0, b: 255 },
			bold: false,
			italic: true,
			underline: true,
			strikethrough: false,
			inverse: false,
			dim: false,
		};
		expect(() => decodeTextStyle(style)).not.toThrow();
	});

	test("rejects invalid RGB in foreground", () => {
		const style = {
			foreground: { r: 256, g: 0, b: 0 },
			bold: false,
			italic: false,
			underline: false,
			strikethrough: false,
			inverse: false,
			dim: false,
		};
		expect(() => decodeTextStyle(style)).toThrow();
	});
});

describe("StyledTextSchema", () => {
	test("accepts valid styled text", () => {
		const styledText = {
			text: "Hello",
			styles: {
				bold: true,
				italic: false,
				underline: false,
				strikethrough: false,
				inverse: false,
				dim: false,
			},
		};
		expect(() => decodeStyledText(styledText)).not.toThrow();
	});

	test("accepts empty text", () => {
		const styledText = {
			text: "",
			styles: {
				bold: false,
				italic: false,
				underline: false,
				strikethrough: false,
				inverse: false,
				dim: false,
			},
		};
		expect(() => decodeStyledText(styledText)).not.toThrow();
	});

	test("rejects missing text", () => {
		const styledText = {
			styles: {
				bold: false,
				italic: false,
				underline: false,
				strikethrough: false,
				inverse: false,
				dim: false,
			},
		};
		expect(() => decodeStyledText(styledText)).toThrow();
	});
});

// ============================================================================
// RenderNode Schema Tests (Base Properties)
// ============================================================================

// Helper to create minimal valid nodes for testing
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

// ============================================================================
// RenderNode Union Schema Tests
// ============================================================================

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
