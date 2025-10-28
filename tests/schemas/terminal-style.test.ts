/**
 * Tests for TerminalStyle Schema
 *
 * Tests validation of terminal styling with colors and text formatting flags.
 */

import { describe, expect, test } from "bun:test";
import { decodeTerminalStyle } from "../../src/schemas/terminal.js";

describe("TerminalStyleSchema", () => {
	test("accepts empty style object", () => {
		const style = {};
		expect(() => decodeTerminalStyle(style)).not.toThrow();
	});

	test("accepts style with foreground color", () => {
		const style = {
			foreground: { r: 255, g: 0, b: 0 },
		};
		expect(() => decodeTerminalStyle(style)).not.toThrow();
	});

	test("accepts style with background color", () => {
		const style = {
			background: { r: 0, g: 0, b: 255 },
		};
		expect(() => decodeTerminalStyle(style)).not.toThrow();
	});

	test("accepts style with all flags", () => {
		const style = {
			bold: true,
			italic: true,
			underline: true,
			strikethrough: true,
			dim: true,
			inverse: true,
		};
		expect(() => decodeTerminalStyle(style)).not.toThrow();
	});

	test("accepts style with colors and flags", () => {
		const style = {
			foreground: { r: 255, g: 255, b: 0 },
			background: { r: 0, g: 0, b: 0 },
			bold: true,
			italic: false,
			underline: true,
			strikethrough: false,
			dim: false,
			inverse: false,
		};
		expect(() => decodeTerminalStyle(style)).not.toThrow();
	});

	test("rejects invalid foreground color", () => {
		const style = {
			foreground: { r: 256, g: 0, b: 0 },
		};
		expect(() => decodeTerminalStyle(style)).toThrow();
	});

	test("rejects non-boolean bold", () => {
		const style = {
			bold: "yes",
		};
		expect(() => decodeTerminalStyle(style)).toThrow();
	});
});
