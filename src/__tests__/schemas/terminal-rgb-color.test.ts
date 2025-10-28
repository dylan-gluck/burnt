/**
 * Tests for RGBColor Schema
 *
 * Tests validation of RGB color objects with values 0-255.
 */

import { describe, expect, test } from "bun:test";
import { decodeRGBColor } from "../../schemas/terminal.js";

describe("RGBColorSchema", () => {
	test("accepts valid RGB color", () => {
		const color = { r: 255, g: 128, b: 0 };
		expect(() => decodeRGBColor(color)).not.toThrow();
	});

	test("accepts black color", () => {
		const color = { r: 0, g: 0, b: 0 };
		expect(() => decodeRGBColor(color)).not.toThrow();
	});

	test("accepts white color", () => {
		const color = { r: 255, g: 255, b: 255 };
		expect(() => decodeRGBColor(color)).not.toThrow();
	});

	test("rejects negative values", () => {
		const color = { r: -1, g: 128, b: 0 };
		expect(() => decodeRGBColor(color)).toThrow();
	});

	test("rejects values above 255", () => {
		const color = { r: 256, g: 128, b: 0 };
		expect(() => decodeRGBColor(color)).toThrow();
	});

	test("rejects non-integer values", () => {
		const color = { r: 255.5, g: 128, b: 0 };
		expect(() => decodeRGBColor(color)).toThrow();
	});
});
