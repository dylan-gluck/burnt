/**
 * Unit tests for LayoutRequest type
 *
 * Tests the LayoutRequest type which represents a request to calculate
 * layout for a specific node with given terminal dimensions.
 */

import { describe, expect, test } from "bun:test";
import type { LayoutRequest } from "../../src/types/layout.js";

// Test Helpers & Factories

const createLayoutRequest = (
	overrides: Partial<LayoutRequest> = {}
): LayoutRequest => ({
	nodeId: "node-123",
	terminalWidth: 80,
	terminalHeight: 24,
	force: false,
	...overrides,
});

// Tests

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
