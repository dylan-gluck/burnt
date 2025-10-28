/**
 * Unit tests for type guard functions
 * Tests all node type guards (isRootNode, isTextNode, isBoxNode, etc.)
 */

import { describe, expect, test } from "bun:test";
import {
	createNode,
	isBoxNode,
	isNewlineNode,
	isRootNode,
	isSpacerNode,
	isStaticNode,
	isTextNode,
	isTransformNode,
	NodeType,
} from "../../types/nodes";

// Test helper for type guard tests
const typeGuards = [
	[isRootNode, NodeType.ROOT, NodeType.TEXT],
	[isTextNode, NodeType.TEXT, NodeType.BOX],
	[isBoxNode, NodeType.BOX, NodeType.NEWLINE],
	[isNewlineNode, NodeType.NEWLINE, NodeType.SPACER],
	[isSpacerNode, NodeType.SPACER, NodeType.STATIC],
	[isStaticNode, NodeType.STATIC, NodeType.TRANSFORM],
	[isTransformNode, NodeType.TRANSFORM, NodeType.ROOT],
] as const;

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
