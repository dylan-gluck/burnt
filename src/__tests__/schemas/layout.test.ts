/**
 * Tests for Layout Schemas
 *
 * Tests validation of layout requests and layout results.
 */

import { describe, expect, test } from "bun:test";
import {
	decodeChildLayoutEntry,
	decodeLayoutRequest,
	decodeLayoutResult,
} from "../../schemas/layout.js";

// ============================================================================
// LayoutRequest Schema Tests
// ============================================================================

describe("LayoutRequestSchema", () => {
	test("accepts valid layout request", () => {
		const request = {
			nodeId: "node-1",
			terminalWidth: 80,
			terminalHeight: 24,
			force: false,
		};
		expect(() => decodeLayoutRequest(request)).not.toThrow();
	});

	test("accepts layout request with force=true", () => {
		const request = {
			nodeId: "root",
			terminalWidth: 120,
			terminalHeight: 40,
			force: true,
		};
		expect(() => decodeLayoutRequest(request)).not.toThrow();
	});

	test("accepts large terminal dimensions", () => {
		const request = {
			nodeId: "node-1",
			terminalWidth: 300,
			terminalHeight: 100,
			force: false,
		};
		expect(() => decodeLayoutRequest(request)).not.toThrow();
	});

	test("rejects empty nodeId", () => {
		const request = {
			nodeId: "",
			terminalWidth: 80,
			terminalHeight: 24,
			force: false,
		};
		expect(() => decodeLayoutRequest(request)).toThrow();
	});

	test("rejects zero terminalWidth", () => {
		const request = {
			nodeId: "node-1",
			terminalWidth: 0,
			terminalHeight: 24,
			force: false,
		};
		expect(() => decodeLayoutRequest(request)).toThrow();
	});

	test("rejects negative terminalWidth", () => {
		const request = {
			nodeId: "node-1",
			terminalWidth: -80,
			terminalHeight: 24,
			force: false,
		};
		expect(() => decodeLayoutRequest(request)).toThrow();
	});

	test("rejects zero terminalHeight", () => {
		const request = {
			nodeId: "node-1",
			terminalWidth: 80,
			terminalHeight: 0,
			force: false,
		};
		expect(() => decodeLayoutRequest(request)).toThrow();
	});

	test("rejects negative terminalHeight", () => {
		const request = {
			nodeId: "node-1",
			terminalWidth: 80,
			terminalHeight: -24,
			force: false,
		};
		expect(() => decodeLayoutRequest(request)).toThrow();
	});

	test("rejects non-integer terminalWidth", () => {
		const request = {
			nodeId: "node-1",
			terminalWidth: 80.5,
			terminalHeight: 24,
			force: false,
		};
		expect(() => decodeLayoutRequest(request)).toThrow();
	});

	test("rejects non-boolean force", () => {
		const request = {
			nodeId: "node-1",
			terminalWidth: 80,
			terminalHeight: 24,
			force: "yes",
		};
		expect(() => decodeLayoutRequest(request)).toThrow();
	});

	test("rejects missing fields", () => {
		const request = {
			nodeId: "node-1",
			terminalWidth: 80,
			// Missing terminalHeight and force
		};
		expect(() => decodeLayoutRequest(request)).toThrow();
	});
});

// ============================================================================
// LayoutResult Schema Tests
// ============================================================================

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

// ============================================================================
// ChildLayoutEntry Schema Tests
// ============================================================================

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
