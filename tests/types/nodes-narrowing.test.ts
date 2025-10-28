/**
 * Unit tests for TypeScript type narrowing with type guards
 * Tests that type guards enable proper TypeScript type narrowing for node types
 */

import { describe, expect, test } from "bun:test";
import {
	type BoxProps,
	createNode,
	isBoxNode,
	isNewlineNode,
	isStaticNode,
	isTextNode,
	isTransformNode,
	NodeType,
	type RenderNode,
} from "../../src/types/nodes";

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

	test.each<
		[NodeType, (node: RenderNode) => boolean, (node: RenderNode) => void]
	>([
		[
			NodeType.NEWLINE,
			isNewlineNode,
			(n: RenderNode) => {
				if (isNewlineNode(n)) {
					expect(typeof n.count).toBe("number");
				}
			},
		],
		[
			NodeType.STATIC,
			isStaticNode,
			(n: RenderNode) => {
				if (isStaticNode(n)) {
					expect(n.frozenContent).toBeDefined();
				}
			},
		],
		[
			NodeType.TRANSFORM,
			isTransformNode,
			(n: RenderNode) => {
				if (isTransformNode(n)) {
					expect(n.transformedContent).toBeDefined();
				}
			},
		],
	])("type guards enable narrowing for %s", (type, guard, assertion) => {
		const node: RenderNode = createNode(type);

		if (guard(node)) {
			assertion(node);
		}
	});
});
