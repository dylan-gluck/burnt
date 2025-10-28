/**
 * Tests for FocusState Schema
 *
 * Tests validation of focus state tracking for UI nodes.
 */

import { describe, expect, test } from "bun:test";
import { decodeFocusState } from "../../src/schemas/input.js";

// ============================================================================
// Test Helpers & Factories
// ============================================================================

const createFocusState = (overrides = {}) => ({
	focusedNodeId: null,
	focusHistory: [],
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
// FocusState Schema Tests
// ============================================================================

describe("FocusStateSchema", () => {
	test("accepts focus state with no focus", () => {
		expectValid(decodeFocusState, createFocusState());
	});

	test("accepts focus state with focused node", () => {
		expectValid(
			decodeFocusState,
			createFocusState({ focusedNodeId: "node-1" })
		);
	});

	test("accepts focus state with history", () => {
		expectValid(
			decodeFocusState,
			createFocusState({
				focusedNodeId: "node-3",
				focusHistory: ["node-1", "node-2"],
			})
		);
	});

	test("accepts empty string as focusedNodeId", () => {
		expectValid(decodeFocusState, createFocusState({ focusedNodeId: "" }));
	});

	test("rejects non-string focusedNodeId", () => {
		expectInvalid(decodeFocusState, {
			...createFocusState(),
			focusedNodeId: 123,
		});
	});

	test("rejects non-array focusHistory", () => {
		expectInvalid(decodeFocusState, {
			...createFocusState({ focusedNodeId: "node-1" }),
			focusHistory: "node-2",
		});
	});

	test("rejects non-string elements in focusHistory", () => {
		expectInvalid(
			decodeFocusState,
			createFocusState({
				focusedNodeId: "node-1",
				focusHistory: ["node-2", 123] as unknown[],
			})
		);
	});

	test("rejects missing focusHistory", () => {
		expectInvalid(decodeFocusState, { focusedNodeId: "node-1" });
	});
});
