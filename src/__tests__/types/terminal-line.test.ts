/**
 * Unit tests for OutputLine type
 *
 * Tests output lines which represent a single line of terminal output composed of
 * multiple styled segments. Lines can contain mixed styling and formatting.
 */

import { describe, expect, test } from "bun:test";
import type { OutputLine } from "../../types/terminal.js";

describe("OutputLine", () => {
	test("should contain array of segments", () => {
		const line: OutputLine = {
			segments: [
				{ text: "Hello", style: { bold: true } },
				{ text: " ", style: {} },
				{ text: "World", style: { italic: true } },
			],
		};

		expect(line.segments.length).toBe(3);
		expect(line.segments[0].text).toBe("Hello");
		expect(line.segments[2].text).toBe("World");
	});

	test("should support empty line", () => {
		const emptyLine: OutputLine = {
			segments: [],
		};

		expect(emptyLine.segments.length).toBe(0);
	});

	test("should support single segment line", () => {
		const singleLine: OutputLine = {
			segments: [{ text: "Single line text", style: {} }],
		};

		expect(singleLine.segments.length).toBe(1);
	});

	test("should support mixed styling in one line", () => {
		const mixedLine: OutputLine = {
			segments: [
				{ text: "Normal", style: {} },
				{ text: "Bold", style: { bold: true } },
				{ text: "Italic", style: { italic: true } },
				{
					text: "Colored",
					style: { foreground: { r: 0, g: 255, b: 0 } },
				},
			],
		};

		expect(mixedLine.segments.length).toBe(4);
		expect(mixedLine.segments[1].style.bold).toBe(true);
		expect(mixedLine.segments[2].style.italic).toBe(true);
		expect(mixedLine.segments[3].style.foreground).toEqual({
			r: 0,
			g: 255,
			b: 0,
		});
	});
});
