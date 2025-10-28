/**
 * Tests for ResizeEvent Schema
 *
 * Tests validation of terminal resize events with width and height constraints.
 */

import { describe, expect, test } from "bun:test";
import { decodeResizeEvent } from "../../src/schemas/input.js";

// ============================================================================
// Test Helpers & Factories
// ============================================================================

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
// Resize Event Schema Tests
// ============================================================================

describe("ResizeEventSchema", () => {
	test("accepts valid resize event", () => {
		expectValid(decodeResizeEvent, createResizeEvent());
	});

	test("accepts large terminal dimensions", () => {
		expectValid(
			decodeResizeEvent,
			createResizeEvent({ width: 300, height: 100 })
		);
	});

	test("accepts minimum dimensions (1x1)", () => {
		expectValid(decodeResizeEvent, createResizeEvent({ width: 1, height: 1 }));
	});

	test("rejects zero width", () => {
		expectInvalid(decodeResizeEvent, createResizeEvent({ width: 0 }));
	});

	test("rejects zero height", () => {
		expectInvalid(decodeResizeEvent, createResizeEvent({ height: 0 }));
	});

	test("rejects negative width", () => {
		expectInvalid(decodeResizeEvent, createResizeEvent({ width: -80 }));
	});

	test("rejects non-integer dimensions", () => {
		expectInvalid(decodeResizeEvent, createResizeEvent({ width: 80.5 }));
	});

	test("rejects wrong event type", () => {
		expectInvalid(decodeResizeEvent, { ...createResizeEvent(), type: "mouse" });
	});
});
