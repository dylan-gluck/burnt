/**
 * Tests for ANTML Schemas
 *
 * Tests validation of ANTML output and command schemas.
 */

import { describe, expect, test } from "bun:test";
import {
	decodeANTMLCommand,
	decodeANTMLOutput,
} from "../../schemas/terminal.js";

// ============================================================================
// ANTMLOutput Schema Tests
// ============================================================================

describe("ANTMLOutputSchema", () => {
	test("accepts valid ANTML output", () => {
		const output = {
			type: "antml",
			content: "\x1b[31mRed Text\x1b[0m",
		};
		expect(() => decodeANTMLOutput(output)).not.toThrow();
	});

	test("accepts ANTML output with empty content", () => {
		const output = {
			type: "antml",
			content: "",
		};
		expect(() => decodeANTMLOutput(output)).not.toThrow();
	});

	test("rejects wrong type", () => {
		const output = {
			type: "invalid",
			content: "Hello",
		};
		expect(() => decodeANTMLOutput(output)).toThrow();
	});

	test("rejects missing content", () => {
		const output = {
			type: "antml",
		};
		expect(() => decodeANTMLOutput(output)).toThrow();
	});
});

// ============================================================================
// ANTMLCommand Schema Tests
// ============================================================================

describe("ANTMLCommandSchema", () => {
	test("accepts clear command", () => {
		const command = {
			type: "clear",
		};
		expect(() => decodeANTMLCommand(command)).not.toThrow();
	});

	test("accepts flush command", () => {
		const command = {
			type: "flush",
		};
		expect(() => decodeANTMLCommand(command)).not.toThrow();
	});

	test("accepts exit command", () => {
		const command = {
			type: "exit",
		};
		expect(() => decodeANTMLCommand(command)).not.toThrow();
	});

	test("accepts command with payload", () => {
		const command = {
			type: "clear",
			payload: { some: "data" },
		};
		expect(() => decodeANTMLCommand(command)).not.toThrow();
	});

	test("rejects invalid command type", () => {
		const command = {
			type: "invalid",
		};
		expect(() => decodeANTMLCommand(command)).toThrow();
	});
});
