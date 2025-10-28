/**
 * Tests for OutputSegment Schema
 *
 * Tests validation of output segments containing text and styling.
 */

import { describe, expect, test } from "bun:test";
import { decodeOutputSegment } from "../../src/schemas/terminal.js";

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
