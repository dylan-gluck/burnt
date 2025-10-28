/**
 * Unit tests for ResizeEvent type
 *
 * Tests the ResizeEvent type structure, dimensions, and terminal size support.
 */

import { describe, expect, test } from "bun:test";
import type { ResizeEvent } from "../../types/input.js";

const createResizeEvent = (
	overrides: Partial<Omit<ResizeEvent, "type">> = {}
): ResizeEvent => ({
	type: "resize",
	width: 80,
	height: 24,
	...overrides,
});

describe("Input Types", () => {
	describe("ResizeEvent", () => {
		test("has type discriminator and dimensions", () => {
			const resize = createResizeEvent({ width: 120, height: 40 });
			expect(resize.type).toBe("resize");
			expect(resize.width).toBe(120);
			expect(resize.height).toBe(40);
		});

		test.each([
			["standard 80x24", 80, 24],
			["widescreen", 200, 60],
			["small", 40, 10],
		])("supports %s terminal size", (_label, width, height) => {
			const resize = createResizeEvent({ width, height });
			expect(resize.width).toBe(width);
			expect(resize.height).toBe(height);
		});
	});
});
