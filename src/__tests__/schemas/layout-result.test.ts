/**
 * Tests for LayoutResult Schema
 *
 * Tests validation of layout computation results including node ID,
 * layout info, child layouts map, and timestamp.
 */

import { describe, expect, test } from "bun:test";
import { decodeLayoutResult } from "../../schemas/layout.js";

describe("LayoutResultSchema", () => {
	test("accepts valid layout result", () => {
		const result = {
			nodeId: "node-1",
			layout: {
				x: 10,
				y: 20,
				width: 100,
				height: 50,
				left: 5,
				top: 10,
			},
			childLayouts: new Map(),
			timestamp: Date.now(),
		};
		expect(() => decodeLayoutResult(result)).not.toThrow();
	});

	test("accepts layout result with child layouts", () => {
		const result = {
			nodeId: "parent-1",
			layout: {
				x: 0,
				y: 0,
				width: 200,
				height: 100,
				left: 0,
				top: 0,
			},
			childLayouts: new Map([
				[
					"child-1",
					{
						x: 10,
						y: 10,
						width: 50,
						height: 20,
						left: 10,
						top: 10,
					},
				],
			]),
			timestamp: 1234567890,
		};
		expect(() => decodeLayoutResult(result)).not.toThrow();
	});

	test("accepts layout result with timestamp 0", () => {
		const result = {
			nodeId: "node-1",
			layout: {
				x: 0,
				y: 0,
				width: 100,
				height: 50,
				left: 0,
				top: 0,
			},
			childLayouts: new Map(),
			timestamp: 0,
		};
		expect(() => decodeLayoutResult(result)).not.toThrow();
	});

	test("rejects empty nodeId", () => {
		const result = {
			nodeId: "",
			layout: {
				x: 0,
				y: 0,
				width: 100,
				height: 50,
				left: 0,
				top: 0,
			},
			childLayouts: new Map(),
			timestamp: Date.now(),
		};
		expect(() => decodeLayoutResult(result)).toThrow();
	});

	test("rejects invalid layout info", () => {
		const result = {
			nodeId: "node-1",
			layout: {
				x: 0,
				y: 0,
				width: -100, // Invalid negative width
				height: 50,
				left: 0,
				top: 0,
			},
			childLayouts: new Map(),
			timestamp: Date.now(),
		};
		expect(() => decodeLayoutResult(result)).toThrow();
	});

	test("rejects negative timestamp", () => {
		const result = {
			nodeId: "node-1",
			layout: {
				x: 0,
				y: 0,
				width: 100,
				height: 50,
				left: 0,
				top: 0,
			},
			childLayouts: new Map(),
			timestamp: -1,
		};
		expect(() => decodeLayoutResult(result)).toThrow();
	});

	test("rejects missing fields", () => {
		const result = {
			nodeId: "node-1",
			layout: {
				x: 0,
				y: 0,
				width: 100,
				height: 50,
				left: 0,
				top: 0,
			},
			// Missing childLayouts and timestamp
		};
		expect(() => decodeLayoutResult(result)).toThrow();
	});
});
