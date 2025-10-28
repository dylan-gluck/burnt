/**
 * Unit tests for Layout Types
 *
 * Tests type structure, composition, and validation for layout-related types.
 */

import { describe, expect, test } from "bun:test";
import type {
	LayoutInfo,
	LayoutRequest,
	LayoutResult,
	YogaNode,
} from "../../types/layout.js";
import type { BoxProps } from "../../types/nodes.js";

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

describe("Layout Types", () => {
	describe("LayoutInfo", () => {
		test("has all required position and dimension properties", () => {
			const layoutInfo = createLayoutInfo({
				x: 10,
				y: 5,
				width: 80,
				height: 24,
				left: 2,
				top: 1,
			});

			expect(layoutInfo).toMatchObject({
				x: 10,
				y: 5,
				width: 80,
				height: 24,
				left: 2,
				top: 1,
			});
		});

		test("supports zero values for all properties", () => {
			const layoutInfo = createLayoutInfo();
			expect(layoutInfo).toEqual({
				x: 0,
				y: 0,
				width: 80,
				height: 24,
				left: 0,
				top: 0,
			});
		});

		test("supports negative values for relative positioning", () => {
			const layoutInfo = createLayoutInfo({ left: -5, top: -3 });
			expect([layoutInfo.left, layoutInfo.top]).toEqual([-5, -3]);
		});

		test("supports large values for terminal dimensions", () => {
			const layoutInfo = createLayoutInfo({ width: 1000, height: 500 });
			expect([layoutInfo.width, layoutInfo.height]).toEqual([1000, 500]);
		});
	});

	describe("YogaNode", () => {
		test("calculate method accepts width and height", () => {
			const yogaNode = createYogaNode();
			expect(() => yogaNode.calculate(80, 24)).not.toThrow();
		});

		test("getComputedLayout returns LayoutInfo", () => {
			const expectedLayout = createLayoutInfo({
				x: 10,
				y: 5,
				width: 50,
				height: 10,
			});
			const yogaNode = createYogaNode(expectedLayout);
			expect(yogaNode.getComputedLayout()).toMatchObject(expectedLayout);
		});

		test("setStyle accepts BoxProps", () => {
			let capturedStyle: BoxProps | undefined;
			const yogaNode: YogaNode = {
				calculate: () => {},
				getComputedLayout: () => createLayoutInfo(),
				setStyle: (style: BoxProps) => {
					capturedStyle = style;
				},
				free: () => {},
			};

			const boxProps: BoxProps = {
				width: 100,
				height: 50,
				flexDirection: "row",
			};
			yogaNode.setStyle(boxProps);
			expect(capturedStyle).toEqual(boxProps);
		});

		test("free method performs resource cleanup", () => {
			let freed = false;
			const yogaNode: YogaNode = {
				calculate: () => {},
				getComputedLayout: () => createLayoutInfo(),
				setStyle: () => {},
				free: () => {
					freed = true;
				},
			};

			yogaNode.free();
			expect(freed).toBe(true);
		});

		test("supports complete layout workflow", () => {
			const workflow: string[] = [];
			const createStep =
				(name: string) =>
				(...args: unknown[]) =>
					workflow.push(
						args.length ? `${name}(${args.join(", ")})` : `${name}()`
					);

			const yogaNode: YogaNode = {
				calculate: createStep("calculate"),
				getComputedLayout: () => {
					workflow.push("getComputedLayout()");
					return createLayoutInfo();
				},
				setStyle: (s) => createStep("setStyle")(JSON.stringify(s)),
				free: createStep("free"),
			};

			yogaNode.setStyle({ width: 100 });
			yogaNode.calculate(80, 24);
			yogaNode.getComputedLayout();
			yogaNode.free();

			expect(workflow).toEqual([
				'setStyle({"width":100})',
				"calculate(80, 24)",
				"getComputedLayout()",
				"free()",
			]);
		});
	});

	describe("LayoutRequest", () => {
		test("has all required properties", () => {
			const request = createLayoutRequest();
			expect(request).toMatchObject({
				nodeId: "node-123",
				terminalWidth: 80,
				terminalHeight: 24,
				force: false,
			});
		});

		test("supports force recalculation flag", () => {
			const request = createLayoutRequest({ force: true });
			expect(request.force).toBe(true);
		});

		test.each([
			["small terminal", 40, 10],
			["standard terminal", 80, 24],
			["large terminal", 200, 60],
		])("supports %s dimensions", (_label, width, height) => {
			const request = createLayoutRequest({
				terminalWidth: width,
				terminalHeight: height,
			});
			expect([request.terminalWidth, request.terminalHeight]).toEqual([
				width,
				height,
			]);
		});
	});

	describe("LayoutResult", () => {
		test("has all required properties", () => {
			const childLayouts = new Map<string, LayoutInfo>([
				["child-1", createLayoutInfo({ width: 40, height: 12 })],
				[
					"child-2",
					createLayoutInfo({ y: 12, width: 40, height: 12, top: 12 }),
				],
			]);

			const result = createLayoutResult({ childLayouts });

			expect(result.nodeId).toBe("node-123");
			expect(result.layout.width).toBe(80);
			expect(result.childLayouts.size).toBe(2);
			expect(result.timestamp).toBeGreaterThan(0);
		});

		test("supports empty child layouts", () => {
			const result = createLayoutResult({ nodeId: "leaf-node" });
			expect(result.childLayouts.size).toBe(0);
		});

		test("supports deeply nested child layouts", () => {
			const childLayouts = new Map<string, LayoutInfo>();
			for (let i = 0; i < 10; i++) {
				childLayouts.set(
					`child-${i}`,
					createLayoutInfo({ x: i * 10, width: 10, height: 5, left: i * 10 })
				);
			}

			const result = createLayoutResult({ childLayouts });
			expect(result.childLayouts.size).toBe(10);

			// Verify each child layout
			for (let i = 0; i < 10; i++) {
				expect(result.childLayouts.get(`child-${i}`)?.x).toBe(i * 10);
			}
		});

		test("supports timestamp for cache invalidation", () => {
			const timestamp1 = Date.now();
			const result1 = createLayoutResult({ timestamp: timestamp1 });
			const result2 = createLayoutResult({ timestamp: timestamp1 + 100 });

			expect(result2.timestamp).toBeGreaterThan(result1.timestamp);
		});
	});

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
});
