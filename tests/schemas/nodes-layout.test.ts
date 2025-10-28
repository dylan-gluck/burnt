/**
 * Tests for LayoutInfo Schema
 *
 * Tests validation of layout information including position and dimensions.
 */

import { describe, expect, test } from "bun:test";
import { decodeLayoutInfo } from "../../src/schemas/nodes.js";

describe("LayoutInfoSchema", () => {
	test("accepts valid layout info", () => {
		const layout = {
			x: 10,
			y: 20,
			width: 100,
			height: 50,
			left: 5,
			top: 10,
		};
		expect(() => decodeLayoutInfo(layout)).not.toThrow();
	});

	test("accepts zero dimensions", () => {
		const layout = {
			x: 0,
			y: 0,
			width: 0,
			height: 0,
			left: 0,
			top: 0,
		};
		expect(() => decodeLayoutInfo(layout)).not.toThrow();
	});

	test("rejects negative width", () => {
		const layout = {
			x: 0,
			y: 0,
			width: -10,
			height: 50,
			left: 0,
			top: 0,
		};
		expect(() => decodeLayoutInfo(layout)).toThrow();
	});

	test("rejects negative height", () => {
		const layout = {
			x: 0,
			y: 0,
			width: 100,
			height: -50,
			left: 0,
			top: 0,
		};
		expect(() => decodeLayoutInfo(layout)).toThrow();
	});

	test("accepts negative x and y (positions can be negative)", () => {
		const layout = {
			x: -10,
			y: -20,
			width: 100,
			height: 50,
			left: -5,
			top: -10,
		};
		expect(() => decodeLayoutInfo(layout)).not.toThrow();
	});

	test("rejects missing fields", () => {
		const layout = {
			x: 0,
			y: 0,
			width: 100,
			// Missing height, left, top
		};
		expect(() => decodeLayoutInfo(layout)).toThrow();
	});
});
