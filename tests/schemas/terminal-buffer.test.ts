/**
 * Tests for OutputBuffer Schema
 *
 * Tests validation of output buffers containing arrays of lines.
 */

import { describe, expect, test } from "bun:test";
import { decodeOutputBuffer } from "../../src/schemas/terminal.js";

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
