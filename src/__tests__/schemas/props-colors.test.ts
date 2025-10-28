/**
 * Tests for Color Schemas
 *
 * Tests validation of RGBColorSchema, HSLColorSchema, and ColorSchema.
 */

import { describe, expect, test } from "bun:test";
import {
	decodeColor,
	decodeHSLColor,
	decodeRGBColor,
} from "../../schemas/props.js";

describe("RGBColorSchema", () => {
	test.each([
		["valid RGB", { r: 255, g: 128, b: 0 }, false],
		["black (0,0,0)", { r: 0, g: 0, b: 0 }, false],
		["white (255,255,255)", { r: 255, g: 255, b: 255 }, false],
		["negative value", { r: -1, g: 128, b: 0 }, true],
		["value above 255", { r: 256, g: 128, b: 0 }, true],
		["non-integer", { r: 255.5, g: 128, b: 0 }, true],
	])("%s", (_label, rgb, shouldThrow) => {
		const test = () => decodeRGBColor(rgb);
		shouldThrow ? expect(test).toThrow() : expect(test).not.toThrow();
	});
});

describe("HSLColorSchema", () => {
	test.each([
		["valid HSL", { h: 180, s: 50, l: 50 }, false],
		["min values", { h: 0, s: 0, l: 0 }, false],
		["max values", { h: 360, s: 100, l: 100 }, false],
		["hue above 360", { h: 361, s: 50, l: 50 }, true],
		["saturation above 100", { h: 180, s: 101, l: 50 }, true],
	])("%s", (_label, hsl, shouldThrow) => {
		const test = () => decodeHSLColor(hsl);
		shouldThrow ? expect(test).toThrow() : expect(test).not.toThrow();
	});
});

describe("ColorSchema", () => {
	test.each([
		["string (red)", "red", false],
		["hex (#FF0000)", "#FF0000", false],
		["RGB object", { r: 255, g: 0, b: 0 }, false],
		["HSL object", { h: 0, s: 100, l: 50 }, false],
		["number", 123, true],
		["null", null, true],
	])("handles %s", (_label, color, shouldThrow) => {
		const test = () => decodeColor(color);
		shouldThrow ? expect(test).toThrow() : expect(test).not.toThrow();
	});
});
