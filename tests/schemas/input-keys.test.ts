/**
 * Tests for Key Schema
 *
 * Tests validation of keyboard key objects including names, sequences, and modifiers.
 */

import { describe, expect, test } from "bun:test";
import { decodeKey } from "../../src/schemas/input.js";

// ============================================================================
// Test Helpers & Factories
// ============================================================================

const createKey = (overrides = {}) => ({
	name: "a",
	sequence: "a",
	ctrl: false,
	meta: false,
	shift: false,
	...overrides,
});

const expectValid = (decoder: (input: unknown) => unknown, input: unknown) => {
	expect(() => decoder(input)).not.toThrow();
};

const expectInvalid = (
	decoder: (input: unknown) => unknown,
	input: unknown
) => {
	expect(() => decoder(input)).toThrow();
};

// ============================================================================
// Key Schema Tests
// ============================================================================

describe("KeySchema", () => {
	test("accepts valid key", () => {
		expectValid(decodeKey, createKey());
	});

	test.each([
		["enter"],
		["escape"],
		["tab"],
		["space"],
		["up"],
		["down"],
		["left"],
		["right"],
	])("accepts special key name: %s", (name) => {
		expectValid(decodeKey, createKey({ name, sequence: "\x1b[A" }));
	});

	test("accepts key with modifiers", () => {
		expectValid(
			decodeKey,
			createKey({ name: "c", sequence: "\x03", ctrl: true })
		);
	});

	test("accepts key with all modifiers", () => {
		expectValid(decodeKey, createKey({ ctrl: true, meta: true, shift: true }));
	});

	test("rejects empty name", () => {
		expectInvalid(decodeKey, createKey({ name: "" }));
	});

	test("rejects non-boolean ctrl", () => {
		expectInvalid(decodeKey, { ...createKey(), ctrl: "yes" });
	});

	test("rejects missing fields", () => {
		expectInvalid(decodeKey, { name: "a", sequence: "a" });
	});
});
