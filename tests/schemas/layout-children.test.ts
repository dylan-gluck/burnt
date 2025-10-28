/**
 * Tests for ChildLayoutEntry Schema
 *
 * Tests validation of child layout entries which represent
 * individual child node layouts within a parent layout.
 */

import { describe, expect, test } from "bun:test";
import { decodeChildLayoutEntry } from "../../src/schemas/layout.js";

describe("ChildLayoutEntrySchema", () => {
	test("accepts valid child layout entry", () => {
		const entry = {
			nodeId: "child-1",
			layout: {
				x: 10,
				y: 20,
				width: 50,
				height: 30,
				left: 5,
				top: 10,
			},
		};
		expect(() => decodeChildLayoutEntry(entry)).not.toThrow();
	});

	test("rejects empty nodeId", () => {
		const entry = {
			nodeId: "",
			layout: {
				x: 10,
				y: 20,
				width: 50,
				height: 30,
				left: 5,
				top: 10,
			},
		};
		expect(() => decodeChildLayoutEntry(entry)).toThrow();
	});

	test("rejects invalid layout", () => {
		const entry = {
			nodeId: "child-1",
			layout: {
				x: 10,
				y: 20,
				width: 50,
				// Missing height, left, top
			},
		};
		expect(() => decodeChildLayoutEntry(entry)).toThrow();
	});
});
