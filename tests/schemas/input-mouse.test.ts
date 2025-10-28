/**
 * Tests for MouseEvent Schema
 *
 * Tests validation of mouse events including coordinates, buttons, and actions.
 */

import { describe, expect, test } from "bun:test";
import { decodeMouseEvent } from "../../src/schemas/input.js";

// ============================================================================
// Test Helpers & Factories
// ============================================================================

const createMouseEvent = (overrides = {}) => ({
	type: "mouse",
	x: 0,
	y: 0,
	button: "left",
	action: "press",
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
// Mouse Event Schema Tests
// ============================================================================

describe("MouseEventSchema", () => {
	test("accepts valid mouse press event", () => {
		expectValid(decodeMouseEvent, createMouseEvent({ x: 10, y: 20 }));
	});

	test("accepts mouse release event", () => {
		expectValid(decodeMouseEvent, createMouseEvent({ action: "release" }));
	});

	test("accepts mouse move event", () => {
		expectValid(
			decodeMouseEvent,
			createMouseEvent({ x: 50, y: 30, action: "move" })
		);
	});

	test.each([["left"], ["right"], ["middle"], ["wheelUp"], ["wheelDown"]])(
		"accepts button type: %s",
		(button) => {
			expectValid(decodeMouseEvent, createMouseEvent({ button }));
		}
	);

	test.each([["press"], ["release"], ["move"]])(
		"accepts action type: %s",
		(action) => {
			expectValid(decodeMouseEvent, createMouseEvent({ action }));
		}
	);

	test("rejects negative x coordinate", () => {
		expectInvalid(decodeMouseEvent, createMouseEvent({ x: -1 }));
	});

	test("rejects negative y coordinate", () => {
		expectInvalid(decodeMouseEvent, createMouseEvent({ y: -1 }));
	});

	test("rejects non-integer coordinates", () => {
		expectInvalid(decodeMouseEvent, createMouseEvent({ x: 10.5 }));
	});

	test("rejects invalid button", () => {
		expectInvalid(decodeMouseEvent, createMouseEvent({ button: "invalid" }));
	});

	test("rejects invalid action", () => {
		expectInvalid(decodeMouseEvent, createMouseEvent({ action: "invalid" }));
	});

	test("rejects wrong event type", () => {
		expectInvalid(decodeMouseEvent, {
			...createMouseEvent(),
			type: "keypress",
		});
	});
});
