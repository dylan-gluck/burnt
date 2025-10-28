/**
 * Tests for KeyPress Event Schema
 *
 * Tests validation of keyboard press events combining keys and modifiers.
 */

import { describe, expect, test } from "bun:test";
import { decodeKeyPress } from "../../src/schemas/input.js";

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

const createModifiers = (overrides = {}) => ({
	ctrl: false,
	alt: false,
	shift: false,
	meta: false,
	...overrides,
});

const createKeyPress = (keyOverrides = {}, modifierOverrides = {}) => ({
	type: "keypress",
	key: createKey(keyOverrides),
	modifiers: createModifiers(modifierOverrides),
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
// KeyPress Event Schema Tests
// ============================================================================

describe("KeyPressSchema", () => {
	test("accepts valid keypress event", () => {
		expectValid(decodeKeyPress, createKeyPress());
	});

	test("accepts keypress with Ctrl+C", () => {
		expectValid(
			decodeKeyPress,
			createKeyPress(
				{ name: "c", sequence: "\x03", ctrl: true },
				{ ctrl: true }
			)
		);
	});

	test("rejects wrong event type", () => {
		expectInvalid(decodeKeyPress, { ...createKeyPress(), type: "invalid" });
	});

	test("rejects invalid key", () => {
		expectInvalid(decodeKeyPress, createKeyPress({ name: "" }));
	});

	test("rejects missing modifiers", () => {
		expectInvalid(decodeKeyPress, {
			type: "keypress",
			key: createKey(),
		});
	});
});
