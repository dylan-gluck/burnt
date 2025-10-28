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

describe("Layout Types", () => {
	describe("LayoutInfo", () => {
		test("should have all required position and dimension properties", () => {
			const layoutInfo: LayoutInfo = {
				x: 10,
				y: 5,
				width: 80,
				height: 24,
				left: 2,
				top: 1,
			};

			expect(layoutInfo.x).toBe(10);
			expect(layoutInfo.y).toBe(5);
			expect(layoutInfo.width).toBe(80);
			expect(layoutInfo.height).toBe(24);
			expect(layoutInfo.left).toBe(2);
			expect(layoutInfo.top).toBe(1);
		});

		test("should support zero values for all properties", () => {
			const layoutInfo: LayoutInfo = {
				x: 0,
				y: 0,
				width: 0,
				height: 0,
				left: 0,
				top: 0,
			};

			expect(layoutInfo).toEqual({
				x: 0,
				y: 0,
				width: 0,
				height: 0,
				left: 0,
				top: 0,
			});
		});

		test("should support negative values for relative positioning", () => {
			const layoutInfo: LayoutInfo = {
				x: 0,
				y: 0,
				width: 10,
				height: 10,
				left: -5,
				top: -3,
			};

			expect(layoutInfo.left).toBe(-5);
			expect(layoutInfo.top).toBe(-3);
		});

		test("should support large values for terminal dimensions", () => {
			const layoutInfo: LayoutInfo = {
				x: 0,
				y: 0,
				width: 1000,
				height: 500,
				left: 0,
				top: 0,
			};

			expect(layoutInfo.width).toBe(1000);
			expect(layoutInfo.height).toBe(500);
		});
	});

	describe("YogaNode", () => {
		test("should define calculate method signature", () => {
			const mockYogaNode: YogaNode = {
				calculate: (width: number, height: number) => {
					expect(typeof width).toBe("number");
					expect(typeof height).toBe("number");
				},
				getComputedLayout: () => ({
					x: 0,
					y: 0,
					width: 0,
					height: 0,
					left: 0,
					top: 0,
				}),
				setStyle: () => {},
				free: () => {},
			};

			mockYogaNode.calculate(80, 24);
		});

		test("should define getComputedLayout method returning LayoutInfo", () => {
			const expectedLayout: LayoutInfo = {
				x: 10,
				y: 5,
				width: 50,
				height: 10,
				left: 2,
				top: 1,
			};

			const mockYogaNode: YogaNode = {
				calculate: () => {},
				getComputedLayout: () => expectedLayout,
				setStyle: () => {},
				free: () => {},
			};

			const layout = mockYogaNode.getComputedLayout();
			expect(layout).toEqual(expectedLayout);
		});

		test("should define setStyle method accepting BoxProps", () => {
			const boxProps: BoxProps = {
				width: 100,
				height: 50,
				flexDirection: "row",
				justifyContent: "center",
				alignItems: "center",
				padding: 2,
			};

			const mockYogaNode: YogaNode = {
				calculate: () => {},
				getComputedLayout: () => ({
					x: 0,
					y: 0,
					width: 0,
					height: 0,
					left: 0,
					top: 0,
				}),
				setStyle: (style: BoxProps) => {
					expect(style).toEqual(boxProps);
				},
				free: () => {},
			};

			mockYogaNode.setStyle(boxProps);
		});

		test("should define free method for resource cleanup", () => {
			let freed = false;

			const mockYogaNode: YogaNode = {
				calculate: () => {},
				getComputedLayout: () => ({
					x: 0,
					y: 0,
					width: 0,
					height: 0,
					left: 0,
					top: 0,
				}),
				setStyle: () => {},
				free: () => {
					freed = true;
				},
			};

			mockYogaNode.free();
			expect(freed).toBe(true);
		});

		test("should support complete layout workflow", () => {
			const workflow: string[] = [];

			const mockYogaNode: YogaNode = {
				calculate: (width: number, height: number) => {
					workflow.push(`calculate(${width}, ${height})`);
				},
				getComputedLayout: () => {
					workflow.push("getComputedLayout()");
					return {
						x: 0,
						y: 0,
						width: 80,
						height: 24,
						left: 0,
						top: 0,
					};
				},
				setStyle: (style: BoxProps) => {
					workflow.push(`setStyle(${JSON.stringify(style)})`);
				},
				free: () => {
					workflow.push("free()");
				},
			};

			// Typical workflow: setStyle -> calculate -> getComputedLayout -> free
			mockYogaNode.setStyle({ width: 100 });
			mockYogaNode.calculate(80, 24);
			mockYogaNode.getComputedLayout();
			mockYogaNode.free();

			expect(workflow).toEqual([
				'setStyle({"width":100})',
				"calculate(80, 24)",
				"getComputedLayout()",
				"free()",
			]);
		});
	});

	describe("LayoutRequest", () => {
		test("should have all required properties", () => {
			const request: LayoutRequest = {
				nodeId: "node-123",
				terminalWidth: 80,
				terminalHeight: 24,
				force: false,
			};

			expect(request.nodeId).toBe("node-123");
			expect(request.terminalWidth).toBe(80);
			expect(request.terminalHeight).toBe(24);
			expect(request.force).toBe(false);
		});

		test("should support force recalculation flag", () => {
			const forcedRequest: LayoutRequest = {
				nodeId: "node-456",
				terminalWidth: 120,
				terminalHeight: 40,
				force: true,
			};

			expect(forcedRequest.force).toBe(true);
		});

		test("should support various terminal dimensions", () => {
			const smallTerminal: LayoutRequest = {
				nodeId: "node-1",
				terminalWidth: 40,
				terminalHeight: 10,
				force: false,
			};

			const largeTerminal: LayoutRequest = {
				nodeId: "node-2",
				terminalWidth: 200,
				terminalHeight: 60,
				force: false,
			};

			expect(smallTerminal.terminalWidth).toBe(40);
			expect(smallTerminal.terminalHeight).toBe(10);
			expect(largeTerminal.terminalWidth).toBe(200);
			expect(largeTerminal.terminalHeight).toBe(60);
		});
	});

	describe("LayoutResult", () => {
		test("should have all required properties", () => {
			const childLayouts = new Map<string, LayoutInfo>();
			childLayouts.set("child-1", {
				x: 0,
				y: 0,
				width: 40,
				height: 12,
				left: 0,
				top: 0,
			});
			childLayouts.set("child-2", {
				x: 0,
				y: 12,
				width: 40,
				height: 12,
				left: 0,
				top: 12,
			});

			const result: LayoutResult = {
				nodeId: "node-123",
				layout: {
					x: 0,
					y: 0,
					width: 80,
					height: 24,
					left: 0,
					top: 0,
				},
				childLayouts,
				timestamp: Date.now(),
			};

			expect(result.nodeId).toBe("node-123");
			expect(result.layout.width).toBe(80);
			expect(result.layout.height).toBe(24);
			expect(result.childLayouts.size).toBe(2);
			expect(result.timestamp).toBeGreaterThan(0);
		});

		test("should support empty child layouts", () => {
			const result: LayoutResult = {
				nodeId: "leaf-node",
				layout: {
					x: 10,
					y: 5,
					width: 20,
					height: 5,
					left: 10,
					top: 5,
				},
				childLayouts: new Map(),
				timestamp: Date.now(),
			};

			expect(result.childLayouts.size).toBe(0);
		});

		test("should support deeply nested child layouts", () => {
			const childLayouts = new Map<string, LayoutInfo>();

			// Simulate a tree structure with multiple children
			for (let i = 0; i < 10; i++) {
				childLayouts.set(`child-${i}`, {
					x: i * 10,
					y: 0,
					width: 10,
					height: 5,
					left: i * 10,
					top: 0,
				});
			}

			const result: LayoutResult = {
				nodeId: "parent-node",
				layout: {
					x: 0,
					y: 0,
					width: 100,
					height: 5,
					left: 0,
					top: 0,
				},
				childLayouts,
				timestamp: Date.now(),
			};

			expect(result.childLayouts.size).toBe(10);

			// Verify each child layout
			for (let i = 0; i < 10; i++) {
				const childLayout = result.childLayouts.get(`child-${i}`);
				expect(childLayout).toBeDefined();
				expect(childLayout?.x).toBe(i * 10);
			}
		});

		test("should support timestamp for cache invalidation", () => {
			const timestamp1 = Date.now();
			const result1: LayoutResult = {
				nodeId: "node-1",
				layout: { x: 0, y: 0, width: 80, height: 24, left: 0, top: 0 },
				childLayouts: new Map(),
				timestamp: timestamp1,
			};

			// Simulate time passing
			const timestamp2 = timestamp1 + 100;
			const result2: LayoutResult = {
				nodeId: "node-1",
				layout: { x: 0, y: 0, width: 80, height: 24, left: 0, top: 0 },
				childLayouts: new Map(),
				timestamp: timestamp2,
			};

			expect(result2.timestamp).toBeGreaterThan(result1.timestamp);
		});
	});

	describe("Type Composition", () => {
		test("should compose LayoutRequest and LayoutResult for request-response pattern", () => {
			const request: LayoutRequest = {
				nodeId: "node-999",
				terminalWidth: 80,
				terminalHeight: 24,
				force: false,
			};

			// Simulate layout calculation
			const result: LayoutResult = {
				nodeId: request.nodeId,
				layout: {
					x: 0,
					y: 0,
					width: request.terminalWidth,
					height: request.terminalHeight,
					left: 0,
					top: 0,
				},
				childLayouts: new Map(),
				timestamp: Date.now(),
			};

			expect(result.nodeId).toBe(request.nodeId);
			expect(result.layout.width).toBe(request.terminalWidth);
			expect(result.layout.height).toBe(request.terminalHeight);
		});

		test("should integrate YogaNode with LayoutInfo", () => {
			const expectedLayout: LayoutInfo = {
				x: 5,
				y: 10,
				width: 60,
				height: 20,
				left: 5,
				top: 10,
			};

			const yogaNode: YogaNode = {
				calculate: () => {},
				getComputedLayout: () => expectedLayout,
				setStyle: () => {},
				free: () => {},
			};

			// Simulate using YogaNode in LayoutResult
			const result: LayoutResult = {
				nodeId: "node-with-yoga",
				layout: yogaNode.getComputedLayout(),
				childLayouts: new Map(),
				timestamp: Date.now(),
			};

			expect(result.layout).toEqual(expectedLayout);
		});
	});
});
