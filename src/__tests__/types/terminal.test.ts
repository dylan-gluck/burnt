/**
 * Unit tests for Terminal Output Types
 *
 * Tests type structure, composition, and validation for terminal output types.
 */

import { describe, expect, test } from "bun:test";
import type { RGBColor } from "../../types/nodes.js";
import type {
	ANTMLCommand,
	ANTMLOutput,
	OutputBuffer,
	OutputDiff,
	OutputLine,
	OutputOperation,
	OutputSegment,
	TerminalStyle,
} from "../../types/terminal.js";

describe("Terminal Types", () => {
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

	describe("ANTMLOutput", () => {
		test("should have type discriminator and content", () => {
			const output: ANTMLOutput = {
				type: "antml",
				content: "\x1b[1mBold text\x1b[0m",
			};

			expect(output.type).toBe("antml");
			expect(output.content).toContain("Bold text");
		});

		test("should support empty content", () => {
			const empty: ANTMLOutput = {
				type: "antml",
				content: "",
			};

			expect(empty.content).toBe("");
		});

		test("should support ANSI escape sequences", () => {
			const ansiOutput: ANTMLOutput = {
				type: "antml",
				content:
					"\x1b[38;2;255;0;0mRed text\x1b[0m\n\x1b[38;2;0;255;0mGreen text\x1b[0m",
			};

			expect(ansiOutput.content).toContain("\x1b[38;2;255;0;0m");
			expect(ansiOutput.content).toContain("Red text");
		});
	});

	describe("ANTMLCommand", () => {
		test("should support clear command", () => {
			const clearCmd: ANTMLCommand = {
				type: "clear",
			};

			expect(clearCmd.type).toBe("clear");
			expect(clearCmd.payload).toBeUndefined();
		});

		test("should support flush command", () => {
			const flushCmd: ANTMLCommand = {
				type: "flush",
			};

			expect(flushCmd.type).toBe("flush");
		});

		test("should support exit command", () => {
			const exitCmd: ANTMLCommand = {
				type: "exit",
			};

			expect(exitCmd.type).toBe("exit");
		});

		test("should support optional payload", () => {
			const cmdWithPayload: ANTMLCommand = {
				type: "clear",
				payload: { lines: 10 },
			};

			expect(cmdWithPayload.payload).toEqual({ lines: 10 });
		});
	});

	describe("OutputOperation", () => {
		test("should support insert operation", () => {
			const insertOp: OutputOperation = {
				type: "insert",
				lineIndex: 5,
				newLine: {
					segments: [{ text: "New line", style: {} }],
				},
			};

			expect(insertOp.type).toBe("insert");
			expect(insertOp.lineIndex).toBe(5);
			expect(insertOp.newLine).toBeDefined();
			expect(insertOp.oldLine).toBeUndefined();
		});

		test("should support delete operation", () => {
			const deleteOp: OutputOperation = {
				type: "delete",
				lineIndex: 3,
				oldLine: {
					segments: [{ text: "Deleted line", style: {} }],
				},
			};

			expect(deleteOp.type).toBe("delete");
			expect(deleteOp.lineIndex).toBe(3);
			expect(deleteOp.oldLine).toBeDefined();
			expect(deleteOp.newLine).toBeUndefined();
		});

		test("should support update operation", () => {
			const updateOp: OutputOperation = {
				type: "update",
				lineIndex: 10,
				oldLine: {
					segments: [{ text: "Old content", style: {} }],
				},
				newLine: {
					segments: [{ text: "New content", style: { bold: true } }],
				},
			};

			expect(updateOp.type).toBe("update");
			expect(updateOp.lineIndex).toBe(10);
			expect(updateOp.oldLine).toBeDefined();
			expect(updateOp.newLine).toBeDefined();
			expect(updateOp.oldLine?.segments[0].text).toBe("Old content");
			expect(updateOp.newLine?.segments[0].text).toBe("New content");
		});
	});

	describe("OutputDiff", () => {
		test("should contain array of operations", () => {
			const diff: OutputDiff = {
				operations: [
					{
						type: "insert",
						lineIndex: 0,
						newLine: { segments: [{ text: "Line 1", style: {} }] },
					},
					{
						type: "insert",
						lineIndex: 1,
						newLine: { segments: [{ text: "Line 2", style: {} }] },
					},
				],
			};

			expect(diff.operations.length).toBe(2);
			expect(diff.operations[0].type).toBe("insert");
			expect(diff.operations[1].type).toBe("insert");
		});

		test("should support empty diff (no changes)", () => {
			const noDiff: OutputDiff = {
				operations: [],
			};

			expect(noDiff.operations.length).toBe(0);
		});

		test("should support mixed operations", () => {
			const mixedDiff: OutputDiff = {
				operations: [
					{
						type: "delete",
						lineIndex: 0,
						oldLine: { segments: [{ text: "Removed", style: {} }] },
					},
					{
						type: "insert",
						lineIndex: 0,
						newLine: { segments: [{ text: "Added", style: {} }] },
					},
					{
						type: "update",
						lineIndex: 1,
						oldLine: { segments: [{ text: "Old", style: {} }] },
						newLine: { segments: [{ text: "New", style: {} }] },
					},
				],
			};

			expect(mixedDiff.operations.length).toBe(3);
			expect(mixedDiff.operations[0].type).toBe("delete");
			expect(mixedDiff.operations[1].type).toBe("insert");
			expect(mixedDiff.operations[2].type).toBe("update");
		});
	});

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
});
