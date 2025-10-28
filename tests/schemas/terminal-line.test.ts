/**
 * Tests for OutputLine Schema
 *
 * Tests validation of output lines containing arrays of segments.
 */

import { describe, expect, test } from "bun:test";
import { decodeOutputLine } from "../../src/schemas/terminal.js";

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
