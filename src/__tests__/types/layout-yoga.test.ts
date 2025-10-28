/**
 * Unit tests for YogaNode type
 *
 * Tests the YogaNode interface which wraps Yoga layout engine functionality,
 * including style application, layout calculation, and resource cleanup.
 */

import { describe, expect, test } from "bun:test";
import type { LayoutInfo, YogaNode } from "../../types/layout.js";
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

// Tests

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
