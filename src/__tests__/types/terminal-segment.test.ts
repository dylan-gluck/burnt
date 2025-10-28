/**
 * Unit tests for OutputSegment type
 *
 * Tests output segments which represent styled text fragments within a terminal line.
 * Each segment contains text content and associated styling information.
 */

import { describe, expect, test } from "bun:test";
import type { OutputSegment } from "../../types/terminal.js";

describe("OutputSegment", () => {
	test("should contain text and style", () => {
		const segment: OutputSegment = {
			text: "Hello, World!",
			style: { bold: true },
		};

		expect(segment.text).toBe("Hello, World!");
		expect(segment.style.bold).toBe(true);
	});

	test("should support empty text", () => {
		const emptySegment: OutputSegment = {
			text: "",
			style: {},
		};

		expect(emptySegment.text).toBe("");
	});

	test("should support complex styled text", () => {
		const segment: OutputSegment = {
			text: "Error:",
			style: {
				foreground: { r: 255, g: 0, b: 0 },
				bold: true,
				underline: true,
			},
		};

		expect(segment.text).toBe("Error:");
		expect(segment.style.foreground).toEqual({ r: 255, g: 0, b: 0 });
		expect(segment.style.bold).toBe(true);
		expect(segment.style.underline).toBe(true);
	});

	test("should support whitespace text", () => {
		const spacer: OutputSegment = {
			text: "   ",
			style: {},
		};

		expect(spacer.text).toBe("   ");
		expect(spacer.text.length).toBe(3);
	});
});
