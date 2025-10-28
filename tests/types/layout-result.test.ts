/**
 * Unit tests for LayoutResult type
 *
 * Tests the LayoutResult type which represents the computed layout
 * for a node including its children and timestamp for cache invalidation.
 */

import { describe, expect, test } from "bun:test";
import type { LayoutInfo, LayoutResult } from "../../src/types/layout.js";

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

describe("LayoutResult", () => {
	test("has all required properties", () => {
		const childLayouts = new Map<string, LayoutInfo>([
			["child-1", createLayoutInfo({ width: 40, height: 12 })],
			["child-2", createLayoutInfo({ y: 12, width: 40, height: 12, top: 12 })],
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
