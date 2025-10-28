/**
 * Unit tests for RGBColor type (imported from nodes.js)
 *
 * Tests RGB color structure and value validation for terminal colors.
 */

import { describe, expect, test } from "bun:test";
import type { RGBColor } from "../../types/nodes.js";

describe("RGBColor (imported)", () => {
	test("should define RGB color with valid range", () => {
		const color: RGBColor = { r: 255, g: 128, b: 0 };

		expect(color.r).toBe(255);
		expect(color.g).toBe(128);
		expect(color.b).toBe(0);
	});

	test("should support black color (0, 0, 0)", () => {
		const black: RGBColor = { r: 0, g: 0, b: 0 };

		expect(black).toEqual({ r: 0, g: 0, b: 0 });
	});

	test("should support white color (255, 255, 255)", () => {
		const white: RGBColor = { r: 255, g: 255, b: 255 };

		expect(white).toEqual({ r: 255, g: 255, b: 255 });
	});
});
