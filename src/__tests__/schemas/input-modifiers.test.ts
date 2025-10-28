/**
 * Tests for KeyModifiers Schema
 *
 * Tests validation of keyboard modifier keys (ctrl, alt, shift, meta).
 */

import { describe, expect, test } from "bun:test";
import { decodeKeyModifiers } from "../../schemas/input.js";

// ============================================================================
// Test Helpers & Factories
// ============================================================================

const createModifiers = (overrides = {}) => ({
	ctrl: false,
	alt: false,
	shift: false,
	meta: false,
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
// KeyModifiers Schema Tests
// ============================================================================

describe("KeyModifiersSchema", () => {
	test("accepts no modifiers", () => {
		expectValid(decodeKeyModifiers, createModifiers());
	});

	test("accepts ctrl modifier", () => {
		expectValid(decodeKeyModifiers, createModifiers({ ctrl: true }));
	});

	test("accepts all modifiers", () => {
		expectValid(
			decodeKeyModifiers,
			createModifiers({ ctrl: true, alt: true, shift: true, meta: true })
		);
	});

	test("rejects non-boolean values", () => {
		expectInvalid(decodeKeyModifiers, { ...createModifiers(), ctrl: "yes" });
	});

	test("rejects missing fields", () => {
		expectInvalid(decodeKeyModifiers, { ctrl: true, alt: false });
	});
});
