/**
 * Unit tests for Color types
 * Tests that color properties accept string, RGB, and HSL color formats
 */

import { describe, expect, test } from "bun:test";
import type { TextProps } from "../../types/nodes";

describe("Color Types", () => {
	test.each([
		["string", "red", (c: unknown) => expect(typeof c).toBe("string")],
		[
			"RGB",
			{ r: 255, g: 0, b: 0 },
			(c: unknown) => expect(c).toHaveProperty("r"),
		],
		[
			"HSL",
			{ h: 0, s: 100, l: 50 },
			(c: unknown) => expect(c).toHaveProperty("h"),
		],
	])("Color can be %s", (_label, color, assertion) => {
		const props: TextProps = { color };
		assertion(props.color);
	});
});
