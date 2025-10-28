/**
 * Tests for Transform Props Schema
 *
 * Tests validation of TransformPropsSchema for text transformations.
 */

import { describe, expect, test } from "bun:test";
import { decodeTransformProps } from "../../src/schemas/props.js";

describe("TransformPropsSchema", () => {
	test("accepts valid transform props", () => {
		const props = {
			transform: (text: string) => text.toUpperCase(),
			children: "Hello",
		};
		expect(() => decodeTransformProps(props)).not.toThrow();
	});

	test("accepts missing transform (Schema.Unknown accepts undefined)", () => {
		const props = {
			children: "Hello",
		};
		expect(() => decodeTransformProps(props)).not.toThrow();
	});

	test("accepts missing children (Schema.Unknown accepts undefined)", () => {
		const props = {
			transform: (text: string) => text,
		};
		expect(() => decodeTransformProps(props)).not.toThrow();
	});
});
