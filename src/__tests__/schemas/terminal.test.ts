/**
 * Tests for Terminal Output Schemas
 *
 * Tests validation of RGB colors, terminal styles, output segments, buffers, and diffs.
 */

import { describe, expect, test } from "bun:test";
import {
	decodeANTMLCommand,
	decodeANTMLOutput,
	decodeOutputBuffer,
	decodeOutputDiff,
	decodeOutputLine,
	decodeOutputOperation,
	decodeOutputSegment,
	decodeRGBColor,
	decodeTerminalStyle,
} from "../../schemas/terminal.js";

// ============================================================================
// RGBColor Schema Tests
// ============================================================================

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

// ============================================================================
// TerminalStyle Schema Tests
// ============================================================================

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

// ============================================================================
// OutputSegment Schema Tests
// ============================================================================

describe("OutputSegmentSchema", () => {
	test("accepts valid output segment", () => {
		const segment = {
			text: "Hello",
			style: {},
		};
		expect(() => decodeOutputSegment(segment)).not.toThrow();
	});

	test("accepts segment with empty text", () => {
		const segment = {
			text: "",
			style: {},
		};
		expect(() => decodeOutputSegment(segment)).not.toThrow();
	});

	test("accepts segment with styled text", () => {
		const segment = {
			text: "Bold Text",
			style: {
				bold: true,
				foreground: { r: 255, g: 0, b: 0 },
			},
		};
		expect(() => decodeOutputSegment(segment)).not.toThrow();
	});

	test("rejects missing text", () => {
		const segment = {
			style: {},
		};
		expect(() => decodeOutputSegment(segment)).toThrow();
	});

	test("rejects missing style", () => {
		const segment = {
			text: "Hello",
		};
		expect(() => decodeOutputSegment(segment)).toThrow();
	});
});

// ============================================================================
// OutputLine Schema Tests
// ============================================================================

describe("OutputLineSchema", () => {
	test("accepts empty line", () => {
		const line = {
			segments: [],
		};
		expect(() => decodeOutputLine(line)).not.toThrow();
	});

	test("accepts line with single segment", () => {
		const line = {
			segments: [
				{
					text: "Hello",
					style: {},
				},
			],
		};
		expect(() => decodeOutputLine(line)).not.toThrow();
	});

	test("accepts line with multiple segments", () => {
		const line = {
			segments: [
				{
					text: "Hello ",
					style: { bold: true },
				},
				{
					text: "World",
					style: { italic: true },
				},
			],
		};
		expect(() => decodeOutputLine(line)).not.toThrow();
	});

	test("rejects missing segments", () => {
		const line = {};
		expect(() => decodeOutputLine(line)).toThrow();
	});

	test("rejects invalid segment in array", () => {
		const line = {
			segments: [
				{
					text: "Hello",
					// Missing style
				},
			],
		};
		expect(() => decodeOutputLine(line)).toThrow();
	});
});

// ============================================================================
// OutputBuffer Schema Tests
// ============================================================================

describe("OutputBufferSchema", () => {
	test("accepts empty buffer", () => {
		const buffer = {
			lines: [],
		};
		expect(() => decodeOutputBuffer(buffer)).not.toThrow();
	});

	test("accepts buffer with single line", () => {
		const buffer = {
			lines: [
				{
					segments: [
						{
							text: "Hello",
							style: {},
						},
					],
				},
			],
		};
		expect(() => decodeOutputBuffer(buffer)).not.toThrow();
	});

	test("accepts buffer with multiple lines", () => {
		const buffer = {
			lines: [
				{
					segments: [{ text: "Line 1", style: {} }],
				},
				{
					segments: [{ text: "Line 2", style: {} }],
				},
			],
		};
		expect(() => decodeOutputBuffer(buffer)).not.toThrow();
	});

	test("rejects missing lines", () => {
		const buffer = {};
		expect(() => decodeOutputBuffer(buffer)).toThrow();
	});
});

// ============================================================================
// ANTMLOutput Schema Tests
// ============================================================================

describe("ANTMLOutputSchema", () => {
	test("accepts valid ANTML output", () => {
		const output = {
			type: "antml",
			content: "\x1b[31mRed Text\x1b[0m",
		};
		expect(() => decodeANTMLOutput(output)).not.toThrow();
	});

	test("accepts ANTML output with empty content", () => {
		const output = {
			type: "antml",
			content: "",
		};
		expect(() => decodeANTMLOutput(output)).not.toThrow();
	});

	test("rejects wrong type", () => {
		const output = {
			type: "invalid",
			content: "Hello",
		};
		expect(() => decodeANTMLOutput(output)).toThrow();
	});

	test("rejects missing content", () => {
		const output = {
			type: "antml",
		};
		expect(() => decodeANTMLOutput(output)).toThrow();
	});
});

// ============================================================================
// ANTMLCommand Schema Tests
// ============================================================================

describe("ANTMLCommandSchema", () => {
	test("accepts clear command", () => {
		const command = {
			type: "clear",
		};
		expect(() => decodeANTMLCommand(command)).not.toThrow();
	});

	test("accepts flush command", () => {
		const command = {
			type: "flush",
		};
		expect(() => decodeANTMLCommand(command)).not.toThrow();
	});

	test("accepts exit command", () => {
		const command = {
			type: "exit",
		};
		expect(() => decodeANTMLCommand(command)).not.toThrow();
	});

	test("accepts command with payload", () => {
		const command = {
			type: "clear",
			payload: { some: "data" },
		};
		expect(() => decodeANTMLCommand(command)).not.toThrow();
	});

	test("rejects invalid command type", () => {
		const command = {
			type: "invalid",
		};
		expect(() => decodeANTMLCommand(command)).toThrow();
	});
});

// ============================================================================
// OutputOperation Schema Tests
// ============================================================================

describe("OutputOperationSchema", () => {
	test("accepts insert operation", () => {
		const operation = {
			type: "insert",
			lineIndex: 0,
			newLine: {
				segments: [{ text: "New line", style: {} }],
			},
		};
		expect(() => decodeOutputOperation(operation)).not.toThrow();
	});

	test("accepts delete operation", () => {
		const operation = {
			type: "delete",
			lineIndex: 5,
			oldLine: {
				segments: [{ text: "Old line", style: {} }],
			},
		};
		expect(() => decodeOutputOperation(operation)).not.toThrow();
	});

	test("accepts update operation", () => {
		const operation = {
			type: "update",
			lineIndex: 10,
			oldLine: {
				segments: [{ text: "Old", style: {} }],
			},
			newLine: {
				segments: [{ text: "New", style: {} }],
			},
		};
		expect(() => decodeOutputOperation(operation)).not.toThrow();
	});

	test("rejects negative lineIndex", () => {
		const operation = {
			type: "insert",
			lineIndex: -1,
			newLine: {
				segments: [{ text: "New", style: {} }],
			},
		};
		expect(() => decodeOutputOperation(operation)).toThrow();
	});

	test("rejects non-integer lineIndex", () => {
		const operation = {
			type: "insert",
			lineIndex: 1.5,
			newLine: {
				segments: [{ text: "New", style: {} }],
			},
		};
		expect(() => decodeOutputOperation(operation)).toThrow();
	});

	test("rejects invalid operation type", () => {
		const operation = {
			type: "invalid",
			lineIndex: 0,
		};
		expect(() => decodeOutputOperation(operation)).toThrow();
	});
});

// ============================================================================
// OutputDiff Schema Tests
// ============================================================================

describe("OutputDiffSchema", () => {
	test("accepts empty diff", () => {
		const diff = {
			operations: [],
		};
		expect(() => decodeOutputDiff(diff)).not.toThrow();
	});

	test("accepts diff with single operation", () => {
		const diff = {
			operations: [
				{
					type: "insert",
					lineIndex: 0,
					newLine: {
						segments: [{ text: "New", style: {} }],
					},
				},
			],
		};
		expect(() => decodeOutputDiff(diff)).not.toThrow();
	});

	test("accepts diff with multiple operations", () => {
		const diff = {
			operations: [
				{
					type: "insert",
					lineIndex: 0,
					newLine: {
						segments: [{ text: "Insert", style: {} }],
					},
				},
				{
					type: "delete",
					lineIndex: 5,
					oldLine: {
						segments: [{ text: "Delete", style: {} }],
					},
				},
				{
					type: "update",
					lineIndex: 10,
					oldLine: {
						segments: [{ text: "Old", style: {} }],
					},
					newLine: {
						segments: [{ text: "New", style: {} }],
					},
				},
			],
		};
		expect(() => decodeOutputDiff(diff)).not.toThrow();
	});

	test("rejects missing operations", () => {
		const diff = {};
		expect(() => decodeOutputDiff(diff)).toThrow();
	});

	test("rejects invalid operation in array", () => {
		const diff = {
			operations: [
				{
					type: "invalid",
					lineIndex: 0,
				},
			],
		};
		expect(() => decodeOutputDiff(diff)).toThrow();
	});
});
