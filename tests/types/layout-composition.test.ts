/**
 * Unit tests for Layout Type Composition
 *
 * Tests how layout types compose together, including request-response patterns
 * and integration between YogaNode and LayoutInfo.
 */

import { describe, expect, test } from "bun:test";
import type {
	LayoutInfo,
	LayoutRequest,
	LayoutResult,
	YogaNode,
} from "../../src/types/layout.js";
import type { BoxProps } from "../../src/types/nodes.js";

// Test Helpers & Factories

const createLayoutInfo = (overrides: Partial<LayoutInfo> = {}): LayoutInfo => ({
	x: 0,
	y: 0,
	width: 80,
	height: 24,
	left: 0,
	top: 0,
	...overrides,
});

const createYogaNode = (
	layoutInfo: LayoutInfo = createLayoutInfo()
): YogaNode => {
	const workflow: string[] = [];

	return {
		calculate: (width: number, height: number) => {
			workflow.push(`calculate(${width}, ${height})`);
		},
		getComputedLayout: () => {
			workflow.push("getComputedLayout()");
			return layoutInfo;
		},
		setStyle: (style: BoxProps) => {
			workflow.push(`setStyle(${JSON.stringify(style)})`);
		},
		free: () => {
			workflow.push("free()");
		},
	};
};

const createLayoutRequest = (
	overrides: Partial<LayoutRequest> = {}
): LayoutRequest => ({
	nodeId: "node-123",
	terminalWidth: 80,
	terminalHeight: 24,
	force: false,
	...overrides,
});

const createLayoutResult = (
	overrides: Partial<LayoutResult> = {}
): LayoutResult => ({
	nodeId: "node-123",
	layout: createLayoutInfo(),
	childLayouts: new Map(),
	timestamp: Date.now(),
	...overrides,
});

// Tests

describe("Type Composition", () => {
	test("composes LayoutRequest and LayoutResult for request-response pattern", () => {
		const request = createLayoutRequest({ nodeId: "node-999" });

		const result: LayoutResult = {
			nodeId: request.nodeId,
			layout: createLayoutInfo({
				width: request.terminalWidth,
				height: request.terminalHeight,
			}),
			childLayouts: new Map(),
			timestamp: Date.now(),
		};

		expect(result.nodeId).toBe(request.nodeId);
		expect([result.layout.width, result.layout.height]).toEqual([
			request.terminalWidth,
			request.terminalHeight,
		]);
	});

	test("integrates YogaNode with LayoutInfo", () => {
		const expectedLayout = createLayoutInfo({
			x: 5,
			y: 10,
			width: 60,
			height: 20,
			left: 5,
			top: 10,
		});
		const yogaNode = createYogaNode(expectedLayout);

		const result = createLayoutResult({
			nodeId: "node-with-yoga",
			layout: yogaNode.getComputedLayout(),
		});

		expect(result.layout).toMatchObject(expectedLayout);
	});
});
