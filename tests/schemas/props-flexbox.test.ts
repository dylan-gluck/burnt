/**
 * Tests for Flexbox Layout Schemas
 *
 * Tests validation of FlexDirectionSchema, JustifyContentSchema,
 * AlignItemsSchema, AlignSelfSchema, and BorderStyleSchema.
 */

import { describe, expect, test } from "bun:test";
import {
	decodeAlignItems,
	decodeAlignSelf,
	decodeBorderStyle,
	decodeFlexDirection,
	decodeJustifyContent,
} from "../../src/schemas/props.js";

describe.each([
	[
		"FlexDirectionSchema",
		decodeFlexDirection,
		["row", "column", "row-reverse", "column-reverse"],
	],
	[
		"JustifyContentSchema",
		decodeJustifyContent,
		["flex-start", "flex-end", "center", "space-between", "space-around"],
	],
	[
		"AlignItemsSchema",
		decodeAlignItems,
		["flex-start", "flex-end", "center", "stretch"],
	],
	[
		"AlignSelfSchema",
		decodeAlignSelf,
		["auto", "flex-start", "flex-end", "center", "stretch"],
	],
	[
		"BorderStyleSchema",
		decodeBorderStyle,
		[
			"single",
			"double",
			"round",
			"bold",
			"singleDouble",
			"doubleSingle",
			"classic",
		],
	],
])("%s", (_schemaName, decodeFn, validValues) => {
	test("accepts all valid values", () => {
		for (const value of validValues) {
			expect(() => decodeFn(value)).not.toThrow();
		}
	});

	test("rejects invalid value", () => {
		expect(() => decodeFn("invalid")).toThrow();
	});
});
