/**
 * Tests for InputEvent Union Schema
 *
 * Tests validation of the union type that accepts keypress, mouse, or resize events.
 */

import { describe, expect, test } from "bun:test";
import { decodeInputEvent } from "../../schemas/input.js";

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

const createMouseEvent = (overrides = {}) => ({
	type: "mouse",
	x: 0,
	y: 0,
	button: "left",
	action: "press",
	...overrides,
});

const createResizeEvent = (overrides = {}) => ({
	type: "resize",
	width: 80,
	height: 24,
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
// InputEvent Union Schema Tests
// ============================================================================

describe("InputEventSchema (Union)", () => {
	test("accepts keypress event via union", () => {
		expectValid(decodeInputEvent, createKeyPress());
	});

	test("accepts mouse event via union", () => {
		expectValid(decodeInputEvent, createMouseEvent({ x: 10, y: 20 }));
	});

	test("accepts resize event via union", () => {
		expectValid(decodeInputEvent, createResizeEvent());
	});

	test("rejects invalid event type", () => {
		expectInvalid(decodeInputEvent, { type: "invalid", data: {} });
	});

	test("rejects event with wrong structure for type", () => {
		expectInvalid(decodeInputEvent, { type: "keypress" });
	});
});
