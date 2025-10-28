/**
 * Unit tests for TerminalStyle type
 *
 * Tests terminal text styling including colors, text decorations (bold, italic, underline, etc.),
 * and style composition for terminal output rendering.
 */

import { describe, expect, test } from "bun:test";
import type { TerminalStyle } from "../../types/terminal.js";

describe("TerminalStyle", () => {
	test("should support all optional style properties", () => {
		const style: TerminalStyle = {
			foreground: { r: 255, g: 0, b: 0 },
			background: { r: 0, g: 0, b: 255 },
			bold: true,
			italic: true,
			underline: true,
			strikethrough: true,
			dim: true,
			inverse: true,
		};

		expect(style.foreground).toEqual({ r: 255, g: 0, b: 0 });
		expect(style.background).toEqual({ r: 0, g: 0, b: 255 });
		expect(style.bold).toBe(true);
		expect(style.italic).toBe(true);
		expect(style.underline).toBe(true);
		expect(style.strikethrough).toBe(true);
		expect(style.dim).toBe(true);
		expect(style.inverse).toBe(true);
	});

	test("should support empty style (all properties optional)", () => {
		const emptyStyle: TerminalStyle = {};

		expect(emptyStyle).toEqual({});
	});

	test("should support partial styles", () => {
		const boldOnly: TerminalStyle = { bold: true };
		const colorOnly: TerminalStyle = {
			foreground: { r: 100, g: 200, b: 50 },
		};

		expect(boldOnly.bold).toBe(true);
		expect(boldOnly.foreground).toBeUndefined();
		expect(colorOnly.foreground).toEqual({ r: 100, g: 200, b: 50 });
		expect(colorOnly.bold).toBeUndefined();
	});

	test("should support combination styles", () => {
		const combined: TerminalStyle = {
			foreground: { r: 0, g: 255, b: 0 },
			bold: true,
			underline: true,
		};

		expect(combined.foreground).toBeDefined();
		expect(combined.bold).toBe(true);
		expect(combined.underline).toBe(true);
		expect(combined.italic).toBeUndefined();
	});

	test("should support inverse video style", () => {
		const inverse: TerminalStyle = {
			foreground: { r: 255, g: 255, b: 255 },
			background: { r: 0, g: 0, b: 0 },
			inverse: true,
		};

		expect(inverse.inverse).toBe(true);
	});
});
