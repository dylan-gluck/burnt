/**
 * Unit tests for Terminal Type Composition
 *
 * Tests how terminal types compose together to create complete rendering workflows.
 * Validates that OutputSegment → OutputLine → OutputBuffer → OutputDiff form
 * a coherent type hierarchy for terminal output management.
 */

import { describe, expect, test } from "bun:test";
import type {
	ANTMLOutput,
	OutputBuffer,
	OutputDiff,
	OutputLine,
	OutputSegment,
} from "../../src/types/terminal.js";

describe("Type Composition", () => {
	test("should compose OutputSegment into OutputLine", () => {
		const segments: OutputSegment[] = [
			{ text: "Hello", style: { bold: true } },
			{ text: " ", style: {} },
			{ text: "World", style: { italic: true } },
		];

		const line: OutputLine = { segments };

		expect(line.segments.length).toBe(3);
		expect(line.segments).toEqual(segments);
	});

	test("should compose OutputLine into OutputBuffer", () => {
		const lines: OutputLine[] = [
			{ segments: [{ text: "Line 1", style: {} }] },
			{ segments: [{ text: "Line 2", style: {} }] },
		];

		const buffer: OutputBuffer = { lines };

		expect(buffer.lines.length).toBe(2);
		expect(buffer.lines).toEqual(lines);
	});

	test("should compose OutputBuffer into OutputDiff", () => {
		const oldBuffer: OutputBuffer = {
			lines: [{ segments: [{ text: "Old", style: {} }] }],
		};

		const newBuffer: OutputBuffer = {
			lines: [{ segments: [{ text: "New", style: {} }] }],
		};

		const diff: OutputDiff = {
			operations: [
				{
					type: "update",
					lineIndex: 0,
					oldLine: oldBuffer.lines[0],
					newLine: newBuffer.lines[0],
				},
			],
		};

		expect(diff.operations[0].oldLine).toEqual(oldBuffer.lines[0]);
		expect(diff.operations[0].newLine).toEqual(newBuffer.lines[0]);
	});

	test("should support complete rendering workflow", () => {
		// 1. Create styled segments
		const segments: OutputSegment[] = [
			{ text: "Status: ", style: { dim: true } },
			{
				text: "OK",
				style: { foreground: { r: 0, g: 255, b: 0 }, bold: true },
			},
		];

		// 2. Compose into line
		const line: OutputLine = { segments };

		// 3. Compose into buffer
		const buffer: OutputBuffer = { lines: [line] };

		// 4. Create ANTML output from buffer
		const antml: ANTMLOutput = {
			type: "antml",
			content: "\x1b[2mStatus: \x1b[0m\x1b[38;2;0;255;0m\x1b[1mOK\x1b[0m",
		};

		expect(buffer.lines.length).toBe(1);
		expect(antml.type).toBe("antml");
		expect(antml.content).toContain("Status:");
		expect(antml.content).toContain("OK");
	});
});
