/**
 * Tests for YogaNode Schema
 *
 * Tests validation of Yoga layout nodes.
 */

import { describe, expect, test } from "bun:test";
import { decodeYogaNode } from "../../schemas/nodes.js";

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
