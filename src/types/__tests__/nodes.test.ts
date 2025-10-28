/**
 * Unit tests for render node types and helper functions
 */

import { describe, expect, test } from "bun:test";
import {
	type BoxNode,
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
	type RootNode,
	type SpacerNode,
	type StaticNode,
	type TextNode,
	type TextProps,
	type TransformNode,
} from "../nodes";

// ============================================================================
// Helper Function Tests
// ============================================================================

describe("createRenderTree", () => {
	test("creates a valid render tree with root node", () => {
		const tree = createRenderTree();

		expect(tree).toBeDefined();
		expect(tree.root).toBeDefined();
		expect(tree.root.type).toBe(NodeType.ROOT);
		expect(tree.root.children).toEqual([]);
		expect(tree.root.parent).toBeNull();
		expect(tree.version).toBe(0);
	});

	test("initializes nodeMap with root node", () => {
		const tree = createRenderTree();

		expect(tree.nodeMap.size).toBe(1);
		expect(tree.nodeMap.get(tree.root.id)).toBe(tree.root);
	});

	test("initializes empty dirtyNodes set", () => {
		const tree = createRenderTree();

		expect(tree.dirtyNodes.size).toBe(0);
	});

	test("root node has valid metadata", () => {
		const tree = createRenderTree();

		expect(tree.root.metadata).toBeDefined();
		expect(tree.root.metadata.key).toBeNull();
		expect(tree.root.metadata.fiberNode).toBeNull();
		expect(tree.root.metadata.mounted).toBe(false);
		expect(tree.root.metadata.needsLayout).toBe(false);
		expect(tree.root.metadata.needsRender).toBe(false);
	});

	test("generates unique IDs for multiple trees", () => {
		const tree1 = createRenderTree();
		const tree2 = createRenderTree();

		expect(tree1.root.id).not.toBe(tree2.root.id);
	});
});

// ============================================================================
// createNode Tests
// ============================================================================

describe("createNode", () => {
	test("creates ROOT node", () => {
		const node = createNode(NodeType.ROOT) as RootNode;

		expect(node.type).toBe(NodeType.ROOT);
		expect(node.id).toBeDefined();
		expect(node.children).toEqual([]);
		expect(node.props).toEqual({});
	});

	test("creates TEXT node with default values", () => {
		const node = createNode(NodeType.TEXT) as TextNode;

		expect(node.type).toBe(NodeType.TEXT);
		expect(node.textContent).toBe("");
		expect(node.styledContent).toEqual([]);
		expect(node.props).toEqual({});
	});

	test("creates BOX node", () => {
		const node = createNode(NodeType.BOX) as BoxNode;

		expect(node.type).toBe(NodeType.BOX);
		expect(node.props).toEqual({});
	});

	test("creates NEWLINE node with default count", () => {
		const node = createNode(NodeType.NEWLINE) as NewlineNode;

		expect(node.type).toBe(NodeType.NEWLINE);
		expect(node.count).toBe(1);
	});

	test("creates SPACER node", () => {
		const node = createNode(NodeType.SPACER) as SpacerNode;

		expect(node.type).toBe(NodeType.SPACER);
	});

	test("creates STATIC node with default props", () => {
		const node = createNode(NodeType.STATIC) as StaticNode;

		expect(node.type).toBe(NodeType.STATIC);
		expect(node.frozenContent).toBe("");
		expect(node.props.items).toEqual([]);
		expect(typeof node.props.children).toBe("function");
	});

	test("creates TRANSFORM node with default props", () => {
		const node = createNode(NodeType.TRANSFORM) as TransformNode;

		expect(node.type).toBe(NodeType.TRANSFORM);
		expect(node.transformedContent).toBe("");
		expect(typeof node.props.transform).toBe("function");
	});

	test("all created nodes have unique IDs", () => {
		const nodes = [
			createNode(NodeType.ROOT),
			createNode(NodeType.TEXT),
			createNode(NodeType.BOX),
			createNode(NodeType.NEWLINE),
		];

		const ids = nodes.map((n) => n.id);
		const uniqueIds = new Set(ids);

		expect(uniqueIds.size).toBe(nodes.length);
	});

	test("all created nodes have null layout info initially", () => {
		const node = createNode(NodeType.BOX);

		expect(node.layoutInfo).toBeNull();
		expect(node.yogaNode).toBeNull();
	});

	test("all created nodes have initialized metadata", () => {
		const node = createNode(NodeType.TEXT);

		expect(node.metadata).toBeDefined();
		expect(node.metadata.mounted).toBe(false);
		expect(node.metadata.needsLayout).toBe(false);
		expect(node.metadata.needsRender).toBe(false);
	});
});

// ============================================================================
// Type Guard Tests
// ============================================================================

describe("Type Guards", () => {
	test("isRootNode correctly identifies ROOT nodes", () => {
		const rootNode = createNode(NodeType.ROOT);
		const textNode = createNode(NodeType.TEXT);

		expect(isRootNode(rootNode)).toBe(true);
		expect(isRootNode(textNode)).toBe(false);
	});

	test("isTextNode correctly identifies TEXT nodes", () => {
		const textNode = createNode(NodeType.TEXT);
		const boxNode = createNode(NodeType.BOX);

		expect(isTextNode(textNode)).toBe(true);
		expect(isTextNode(boxNode)).toBe(false);
	});

	test("isBoxNode correctly identifies BOX nodes", () => {
		const boxNode = createNode(NodeType.BOX);
		const newlineNode = createNode(NodeType.NEWLINE);

		expect(isBoxNode(boxNode)).toBe(true);
		expect(isBoxNode(newlineNode)).toBe(false);
	});

	test("isNewlineNode correctly identifies NEWLINE nodes", () => {
		const newlineNode = createNode(NodeType.NEWLINE);
		const spacerNode = createNode(NodeType.SPACER);

		expect(isNewlineNode(newlineNode)).toBe(true);
		expect(isNewlineNode(spacerNode)).toBe(false);
	});

	test("isSpacerNode correctly identifies SPACER nodes", () => {
		const spacerNode = createNode(NodeType.SPACER);
		const staticNode = createNode(NodeType.STATIC);

		expect(isSpacerNode(spacerNode)).toBe(true);
		expect(isSpacerNode(staticNode)).toBe(false);
	});

	test("isStaticNode correctly identifies STATIC nodes", () => {
		const staticNode = createNode(NodeType.STATIC);
		const transformNode = createNode(NodeType.TRANSFORM);

		expect(isStaticNode(staticNode)).toBe(true);
		expect(isStaticNode(transformNode)).toBe(false);
	});

	test("isTransformNode correctly identifies TRANSFORM nodes", () => {
		const transformNode = createNode(NodeType.TRANSFORM);
		const rootNode = createNode(NodeType.ROOT);

		expect(isTransformNode(transformNode)).toBe(true);
		expect(isTransformNode(rootNode)).toBe(false);
	});
});

// ============================================================================
// Type Narrowing Tests
// ============================================================================

describe("TypeScript Type Narrowing", () => {
	test("type guards enable type narrowing for TextNode", () => {
		const node: RenderNode = createNode(NodeType.TEXT);

		if (isTextNode(node)) {
			// TypeScript should infer node as TextNode here
			expect(node.textContent).toBeDefined();
			expect(node.styledContent).toBeDefined();
		}
	});

	test("type guards enable type narrowing for BoxNode", () => {
		const node: RenderNode = createNode(NodeType.BOX);

		if (isBoxNode(node)) {
			// TypeScript should infer node as BoxNode here
			const props: BoxProps = node.props;
			expect(props).toBeDefined();
		}
	});

	test("type guards enable type narrowing for NewlineNode", () => {
		const node: RenderNode = createNode(NodeType.NEWLINE);

		if (isNewlineNode(node)) {
			// TypeScript should infer node as NewlineNode here
			expect(typeof node.count).toBe("number");
		}
	});

	test("type guards enable type narrowing for StaticNode", () => {
		const node: RenderNode = createNode(NodeType.STATIC);

		if (isStaticNode(node)) {
			// TypeScript should infer node as StaticNode here
			expect(node.frozenContent).toBeDefined();
		}
	});

	test("type guards enable type narrowing for TransformNode", () => {
		const node: RenderNode = createNode(NodeType.TRANSFORM);

		if (isTransformNode(node)) {
			// TypeScript should infer node as TransformNode here
			expect(node.transformedContent).toBeDefined();
		}
	});
});

// ============================================================================
// Node Structure Tests
// ============================================================================

describe("Node Structure", () => {
	test("TextNode has correct structure", () => {
		const node = createNode(NodeType.TEXT) as TextNode;

		expect(node).toHaveProperty("id");
		expect(node).toHaveProperty("type");
		expect(node).toHaveProperty("props");
		expect(node).toHaveProperty("children");
		expect(node).toHaveProperty("parent");
		expect(node).toHaveProperty("layoutInfo");
		expect(node).toHaveProperty("yogaNode");
		expect(node).toHaveProperty("metadata");
		expect(node).toHaveProperty("textContent");
		expect(node).toHaveProperty("styledContent");
	});

	test("BoxNode has correct structure", () => {
		const node = createNode(NodeType.BOX) as BoxNode;

		expect(node).toHaveProperty("id");
		expect(node).toHaveProperty("type");
		expect(node).toHaveProperty("props");
		expect(node).toHaveProperty("children");
		expect(node).toHaveProperty("parent");
		expect(node).toHaveProperty("layoutInfo");
		expect(node).toHaveProperty("yogaNode");
		expect(node).toHaveProperty("metadata");
	});

	test("NewlineNode has correct structure", () => {
		const node = createNode(NodeType.NEWLINE) as NewlineNode;

		expect(node).toHaveProperty("id");
		expect(node).toHaveProperty("type");
		expect(node).toHaveProperty("count");
	});

	test("StaticNode has correct structure", () => {
		const node = createNode(NodeType.STATIC) as StaticNode;

		expect(node).toHaveProperty("frozenContent");
		expect(node.props).toHaveProperty("items");
		expect(node.props).toHaveProperty("children");
	});

	test("TransformNode has correct structure", () => {
		const node = createNode(NodeType.TRANSFORM) as TransformNode;

		expect(node).toHaveProperty("transformedContent");
		expect(node.props).toHaveProperty("transform");
		expect(node.props).toHaveProperty("children");
	});
});

// ============================================================================
// Props Interface Tests
// ============================================================================

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

	test("BoxProps margin shortcuts work", () => {
		const props: BoxProps = {
			marginLeft: 5,
			marginRight: 5,
			marginTop: 10,
			marginBottom: 10,
		};

		expect(props.marginLeft).toBe(5);
		expect(props.marginRight).toBe(5);
	});

	test("BoxProps padding shortcuts work", () => {
		const props: BoxProps = {
			paddingLeft: 5,
			paddingRight: 5,
			paddingTop: 10,
			paddingBottom: 10,
		};

		expect(props.paddingLeft).toBe(5);
		expect(props.paddingRight).toBe(5);
	});
});

// ============================================================================
// RenderTree Structure Tests
// ============================================================================

describe("RenderTree Structure", () => {
	test("RenderTree has all required properties", () => {
		const tree = createRenderTree();

		expect(tree).toHaveProperty("root");
		expect(tree).toHaveProperty("nodeMap");
		expect(tree).toHaveProperty("dirtyNodes");
		expect(tree).toHaveProperty("version");
	});

	test("RenderTree nodeMap is a Map", () => {
		const tree = createRenderTree();

		expect(tree.nodeMap instanceof Map).toBe(true);
	});

	test("RenderTree dirtyNodes is a Set", () => {
		const tree = createRenderTree();

		expect(tree.dirtyNodes instanceof Set).toBe(true);
	});

	test("can add nodes to tree nodeMap", () => {
		const tree = createRenderTree();
		const textNode = createNode(NodeType.TEXT);

		tree.nodeMap.set(textNode.id, textNode);

		expect(tree.nodeMap.get(textNode.id)).toBe(textNode);
		expect(tree.nodeMap.size).toBe(2); // root + text
	});

	test("can add nodes to dirtyNodes set", () => {
		const tree = createRenderTree();
		const textNode = createNode(NodeType.TEXT);

		tree.dirtyNodes.add(textNode.id);

		expect(tree.dirtyNodes.has(textNode.id)).toBe(true);
		expect(tree.dirtyNodes.size).toBe(1);
	});
});

// ============================================================================
// Node Metadata Tests
// ============================================================================

describe("Node Metadata", () => {
	test("metadata is initialized correctly", () => {
		const node = createNode(NodeType.TEXT);

		expect(node.metadata.key).toBeNull();
		expect(node.metadata.fiberNode).toBeNull();
		expect(node.metadata.mounted).toBe(false);
		expect(node.metadata.needsLayout).toBe(false);
		expect(node.metadata.needsRender).toBe(false);
	});

	test("metadata can be updated (immutable pattern)", () => {
		const node = createNode(NodeType.TEXT);

		// Simulate updating metadata (should create new object in real implementation)
		const updatedMetadata = {
			...node.metadata,
			mounted: true,
			needsLayout: true,
		};

		expect(updatedMetadata.mounted).toBe(true);
		expect(updatedMetadata.needsLayout).toBe(true);
		expect(node.metadata.mounted).toBe(false); // Original unchanged
	});
});

// ============================================================================
// Color Type Tests
// ============================================================================

describe("Color Types", () => {
	test("Color can be a string", () => {
		const props: TextProps = {
			color: "red",
		};

		expect(typeof props.color).toBe("string");
	});

	test("Color can be RGB", () => {
		const props: TextProps = {
			color: { r: 255, g: 0, b: 0 },
		};

		expect(typeof props.color).toBe("object");
		if (typeof props.color === "object" && "r" in props.color) {
			expect(props.color.r).toBe(255);
		}
	});

	test("Color can be HSL", () => {
		const props: TextProps = {
			color: { h: 0, s: 100, l: 50 },
		};

		expect(typeof props.color).toBe("object");
		if (typeof props.color === "object" && "h" in props.color) {
			expect(props.color.h).toBe(0);
		}
	});
});

// ============================================================================
// Integration Tests
// ============================================================================

describe("Integration", () => {
	test("can create a simple tree structure", () => {
		const tree = createRenderTree();
		const boxNode = createNode(NodeType.BOX) as BoxNode;
		const textNode = createNode(NodeType.TEXT) as TextNode;

		// Simulate adding children
		tree.root.children = [boxNode];
		boxNode.parent = tree.root;
		boxNode.children = [textNode];
		textNode.parent = boxNode;

		// Add to nodeMap
		tree.nodeMap.set(boxNode.id, boxNode);
		tree.nodeMap.set(textNode.id, textNode);

		expect(tree.nodeMap.size).toBe(3); // root + box + text
		expect(tree.root.children[0]).toBe(boxNode);
		expect(boxNode.children[0]).toBe(textNode);
	});

	test("can mark nodes as dirty", () => {
		const tree = createRenderTree();
		const node1 = createNode(NodeType.TEXT);
		const node2 = createNode(NodeType.BOX);

		tree.nodeMap.set(node1.id, node1);
		tree.nodeMap.set(node2.id, node2);
		tree.dirtyNodes.add(node1.id);
		tree.dirtyNodes.add(node2.id);

		expect(tree.dirtyNodes.size).toBe(2);
		expect(tree.dirtyNodes.has(node1.id)).toBe(true);
		expect(tree.dirtyNodes.has(node2.id)).toBe(true);
	});

	test("node type discriminator works correctly", () => {
		const nodes: RenderNode[] = [
			createNode(NodeType.ROOT),
			createNode(NodeType.TEXT),
			createNode(NodeType.BOX),
			createNode(NodeType.NEWLINE),
			createNode(NodeType.SPACER),
			createNode(NodeType.STATIC),
			createNode(NodeType.TRANSFORM),
		];

		const types = nodes.map((n) => n.type);

		expect(types).toEqual([
			NodeType.ROOT,
			NodeType.TEXT,
			NodeType.BOX,
			NodeType.NEWLINE,
			NodeType.SPACER,
			NodeType.STATIC,
			NodeType.TRANSFORM,
		]);
	});
});
