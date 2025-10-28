/**
 * Tests for Static Props Schema
 *
 * Tests validation of StaticPropsSchema for rendering static lists.
 */

import { describe, expect, test } from "bun:test";
import { decodeStaticProps } from "../../src/schemas/props.js";

describe("StaticPropsSchema", () => {
	test("accepts valid static props", () => {
		const props = {
			items: [1, 2, 3],
			children: (_item: unknown, index: number) => `Item ${index}`,
		};
		expect(() => decodeStaticProps(props)).not.toThrow();
	});

	test("accepts empty items array", () => {
		const props = {
			items: [],
			children: () => null,
		};
		expect(() => decodeStaticProps(props)).not.toThrow();
	});

	test("rejects missing items", () => {
		const props = {
			children: () => null,
		};
		expect(() => decodeStaticProps(props)).toThrow();
	});

	test("accepts missing children (Schema.Unknown accepts undefined)", () => {
		const props = {
			items: [1, 2, 3],
		};
		expect(() => decodeStaticProps(props)).not.toThrow();
	});
});
