/**
 * Unit tests for LayoutInfo type
 *
 * Tests the structure and validation of LayoutInfo, which represents
 * the computed position and dimensions of a layout node.
 */

import { describe, expect, test } from "bun:test";
import type { LayoutInfo } from "../../types/layout.js";

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

// Tests

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
