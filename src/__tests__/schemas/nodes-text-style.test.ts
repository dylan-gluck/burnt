/**
 * Tests for TextStyle and StyledText Schemas
 *
 * Tests validation of text styling including colors, formatting flags, and styled text segments.
 */

import { describe, expect, test } from "bun:test";
import { decodeStyledText, decodeTextStyle } from "../../schemas/nodes.js";

describe("TextStyleSchema", () => {
	test("accepts valid text style with all flags false", () => {
		const style = {
			bold: false,
			italic: false,
			underline: false,
			strikethrough: false,
			inverse: false,
			dim: false,
		};
		expect(() => decodeTextStyle(style)).not.toThrow();
	});

	test("accepts text style with foreground color", () => {
		const style = {
			foreground: { r: 255, g: 0, b: 0 },
			bold: true,
			italic: false,
			underline: false,
			strikethrough: false,
			inverse: false,
			dim: false,
		};
		expect(() => decodeTextStyle(style)).not.toThrow();
	});

	test("accepts text style with background color", () => {
		const style = {
			background: { r: 0, g: 0, b: 255 },
			bold: false,
			italic: true,
			underline: true,
			strikethrough: false,
			inverse: false,
			dim: false,
		};
		expect(() => decodeTextStyle(style)).not.toThrow();
	});

	test("rejects invalid RGB in foreground", () => {
		const style = {
			foreground: { r: 256, g: 0, b: 0 },
			bold: false,
			italic: false,
			underline: false,
			strikethrough: false,
			inverse: false,
			dim: false,
		};
		expect(() => decodeTextStyle(style)).toThrow();
	});
});

describe("StyledTextSchema", () => {
	test("accepts valid styled text", () => {
		const styledText = {
			text: "Hello",
			styles: {
				bold: true,
				italic: false,
				underline: false,
				strikethrough: false,
				inverse: false,
				dim: false,
			},
		};
		expect(() => decodeStyledText(styledText)).not.toThrow();
	});

	test("accepts empty text", () => {
		const styledText = {
			text: "",
			styles: {
				bold: false,
				italic: false,
				underline: false,
				strikethrough: false,
				inverse: false,
				dim: false,
			},
		};
		expect(() => decodeStyledText(styledText)).not.toThrow();
	});

	test("rejects missing text", () => {
		const styledText = {
			styles: {
				bold: false,
				italic: false,
				underline: false,
				strikethrough: false,
				inverse: false,
				dim: false,
			},
		};
		expect(() => decodeStyledText(styledText)).toThrow();
	});
});
