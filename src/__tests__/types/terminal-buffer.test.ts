/**
 * Unit tests for OutputBuffer type
 *
 * Tests output buffers which represent the complete terminal screen state as
 * an array of lines. Buffers contain multiple lines of styled terminal output.
 */

import { describe, expect, test } from "bun:test";
import type { OutputBuffer, OutputLine } from "../../types/terminal.js";

describe("OutputBuffer", () => {
	test("should contain array of lines", () => {
		const buffer: OutputBuffer = {
			lines: [
				{ segments: [{ text: "Line 1", style: {} }] },
				{ segments: [{ text: "Line 2", style: {} }] },
				{ segments: [{ text: "Line 3", style: {} }] },
			],
		};

		expect(buffer.lines.length).toBe(3);
		expect(buffer.lines[0].segments[0].text).toBe("Line 1");
		expect(buffer.lines[2].segments[0].text).toBe("Line 3");
	});

	test("should support empty buffer", () => {
		const emptyBuffer: OutputBuffer = {
			lines: [],
		};

		expect(emptyBuffer.lines.length).toBe(0);
	});

	test("should support terminal-sized buffer", () => {
		const terminalHeight = 24;
		const lines: OutputLine[] = [];

		for (let i = 0; i < terminalHeight; i++) {
			lines.push({
				segments: [{ text: `Line ${i + 1}`, style: {} }],
			});
		}

		const buffer: OutputBuffer = { lines };

		expect(buffer.lines.length).toBe(terminalHeight);
	});

	test("should support complex multi-segment lines", () => {
		const buffer: OutputBuffer = {
			lines: [
				{
					segments: [
						{ text: "[", style: { dim: true } },
						{ text: "INFO", style: { foreground: { r: 0, g: 255, b: 0 } } },
						{ text: "]", style: { dim: true } },
						{ text: " ", style: {} },
						{ text: "Application started", style: {} },
					],
				},
				{
					segments: [
						{ text: "[", style: { dim: true } },
						{ text: "ERROR", style: { foreground: { r: 255, g: 0, b: 0 } } },
						{ text: "]", style: { dim: true } },
						{ text: " ", style: {} },
						{ text: "Connection failed", style: { bold: true } },
					],
				},
			],
		};

		expect(buffer.lines.length).toBe(2);
		expect(buffer.lines[0].segments[1].text).toBe("INFO");
		expect(buffer.lines[1].segments[1].text).toBe("ERROR");
	});
});
