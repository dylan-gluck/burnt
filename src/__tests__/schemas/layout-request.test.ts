/**
 * Tests for LayoutRequest Schema
 *
 * Tests validation of layout request parameters including node ID,
 * terminal dimensions, and force flag.
 */

import { describe, expect, test } from "bun:test";
import { decodeLayoutRequest } from "../../schemas/layout.js";

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
