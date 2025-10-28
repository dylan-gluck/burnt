/**
 * Unit tests for render node types and helper functions
 */

import { describe, expect, test } from "bun:test";
import {
	type BoxProps,
	createNode,
	createRenderTree,
	isBoxNode,
	isNewlineNode,
	isRootNode,
	isSpacerNode,
	isStaticNode,
	isTextNode,
	isTransformNode,
	type NewlineNode,
	NodeType,
	type RenderNode,
	type StaticNode,
	type TextProps,
	type TransformNode,
} from "../../types/nodes";

// Test Helpers

const baseNodeProperties = [
	"id",
	"type",
	"children",
	"parent",
	"layoutInfo",
	"yogaNode",
	"metadata",
];

const typeGuards = [
	[isRootNode, NodeType.ROOT, NodeType.TEXT],
	[isTextNode, NodeType.TEXT, NodeType.BOX],
	[isBoxNode, NodeType.BOX, NodeType.NEWLINE],
	[isNewlineNode, NodeType.NEWLINE, NodeType.SPACER],
	[isSpacerNode, NodeType.SPACER, NodeType.STATIC],
	[isStaticNode, NodeType.STATIC, NodeType.TRANSFORM],
	[isTransformNode, NodeType.TRANSFORM, NodeType.ROOT],
] as const;

// createRenderTree Tests

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

// createNode Tests

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

// Type Guard Tests

describe("Type Guards", () => {
	test.each(typeGuards)(
		"%s correctly identifies nodes",
		(guard, matchingType, nonMatchingType) => {
			const matchingNode = createNode(matchingType);
			const nonMatchingNode = createNode(nonMatchingType);

			expect(guard(matchingNode)).toBe(true);
			expect(guard(nonMatchingNode)).toBe(false);
		}
	);
});

// Type Narrowing Tests

describe("TypeScript Type Narrowing", () => {
	test("type guards enable type narrowing for TextNode", () => {
		const node: RenderNode = createNode(NodeType.TEXT);

		if (isTextNode(node)) {
			expect(node.textContent).toBeDefined();
			expect(node.styledContent).toBeDefined();
		}
	});

	test("type guards enable type narrowing for BoxNode", () => {
		const node: RenderNode = createNode(NodeType.BOX);

		if (isBoxNode(node)) {
			const props: BoxProps = node.props;
			expect(props).toBeDefined();
		}
	});

	test.each([
		[
			NodeType.NEWLINE,
			isNewlineNode,
			(n: NewlineNode) => expect(typeof n.count).toBe("number"),
		],
		[
			NodeType.STATIC,
			isStaticNode,
			(n: StaticNode) => expect(n.frozenContent).toBeDefined(),
		],
		[
			NodeType.TRANSFORM,
			isTransformNode,
			(n: TransformNode) => expect(n.transformedContent).toBeDefined(),
		],
	])("type guards enable narrowing for %s", (type, guard, assertion) => {
		const node: RenderNode = createNode(type);

		if (guard(node)) {
			assertion(node);
		}
	});
});

// Node Structure Tests

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

// Props Interface Tests

describe("Props Interfaces", () => {
	test("TextProps supports all style properties", () => {
		const props: TextProps = {
			color: "red",
			backgroundColor: { r: 255, g: 0, b: 0 },
			dimColor: true,
			bold: true,
			italic: true,
			underline: true,
			strikethrough: true,
			inverse: true,
			wrap: "truncate-middle",
		};

		expect(props).toBeDefined();
	});

	test("BoxProps supports all layout properties", () => {
		const props: BoxProps = {
			width: 100,
			height: "50%",
			minWidth: 10,
			maxWidth: 200,
			margin: 5,
			padding: 10,
			flexDirection: "row",
			justifyContent: "space-between",
			alignItems: "center",
			flexGrow: 1,
			borderStyle: "single",
			borderColor: "blue",
		};

		expect(props).toBeDefined();
	});

	test("BoxProps margin and padding shortcuts work", () => {
		const marginProps = {
			marginLeft: 5,
			marginRight: 5,
			marginTop: 10,
			marginBottom: 10,
		};
		const paddingProps = {
			paddingLeft: 5,
			paddingRight: 5,
			paddingTop: 10,
			paddingBottom: 10,
		};

		expect(marginProps).toHaveProperty("marginLeft");
		expect(paddingProps).toHaveProperty("paddingLeft");
	});
});

// RenderTree Structure Tests

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

// Node Metadata Tests

describe("Node Metadata", () => {
	test("metadata is initialized correctly", () => {
		const node = createNode(NodeType.TEXT);

		expect(node.metadata).toMatchObject({
			key: null,
			fiberNode: null,
			mounted: false,
			needsLayout: false,
			needsRender: false,
		});
	});

	test("metadata follows immutable pattern", () => {
		const node = createNode(NodeType.TEXT);

		const updatedMetadata = {
			...node.metadata,
			mounted: true,
			needsLayout: true,
		};

		expect(updatedMetadata.mounted).toBe(true);
		expect(node.metadata.mounted).toBe(false); // Original unchanged
	});
});

// Color Type Tests

describe("Color Types", () => {
	test.each([
		["string", "red", (c: unknown) => expect(typeof c).toBe("string")],
		[
			"RGB",
			{ r: 255, g: 0, b: 0 },
			(c: unknown) => expect(c).toHaveProperty("r"),
		],
		[
			"HSL",
			{ h: 0, s: 100, l: 50 },
			(c: unknown) => expect(c).toHaveProperty("h"),
		],
	])("Color can be %s", (_label, color, assertion) => {
		const props: TextProps = { color };
		assertion(props.color);
	});
});

// Integration Tests

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
