/**
 * Unit tests for node metadata
 * Tests metadata initialization and immutable pattern usage
 */

import { describe, expect, test } from "bun:test";
import { createNode, NodeType } from "../../types/nodes";

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
