/**
 * Tests for Text Props Schemas
 *
 * Tests validation of WrapModeSchema and TextPropsSchema.
 */

import { describe, expect, test } from "bun:test";
import { decodeTextProps, decodeWrapMode } from "../../schemas/props.js";

describe("WrapModeSchema", () => {
	test("accepts all valid wrap modes", () => {
		const validModes = [
			"wrap",
			"truncate",
			"truncate-start",
			"truncate-middle",
			"truncate-end",
		];
		for (const mode of validModes) {
			expect(() => decodeWrapMode(mode)).not.toThrow();
		}
	});

	test("rejects invalid wrap mode", () => {
		expect(() => decodeWrapMode("invalid")).toThrow();
	});
});

describe("TextPropsSchema", () => {
	test("accepts empty props object", () => {
		const props = {};
		expect(() => decodeTextProps(props)).not.toThrow();
	});

	test("accepts valid text props with colors", () => {
		const props = {
			color: "red",
			backgroundColor: { r: 0, g: 0, b: 0 },
			bold: true,
			italic: false,
			wrap: "truncate",
		};
		expect(() => decodeTextProps(props)).not.toThrow();
	});

	test("accepts all styling options", () => {
		const props = {
			bold: true,
			italic: true,
			underline: true,
			strikethrough: true,
			dimColor: true,
			inverse: true,
		};
		expect(() => decodeTextProps(props)).not.toThrow();
	});

	test("rejects invalid color", () => {
		const props = { color: 123 };
		expect(() => decodeTextProps(props)).toThrow();
	});

	test("rejects invalid wrap mode", () => {
		const props = { wrap: "invalid" };
		expect(() => decodeTextProps(props)).toThrow();
	});

	test("rejects non-boolean bold", () => {
		const props = { bold: "yes" };
		expect(() => decodeTextProps(props)).toThrow();
	});
});
