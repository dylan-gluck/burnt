/**
 * Unit tests for FocusState type
 *
 * Tests the FocusState type structure, focus tracking, and focus history management.
 */

import { describe, expect, test } from "bun:test";
import type { FocusState } from "../../types/input.js";

const createFocusState = (overrides: Partial<FocusState> = {}): FocusState => ({
	focusedNodeId: null,
	focusHistory: [],
	...overrides,
});

describe("Input Types", () => {
	describe("FocusState", () => {
		test("tracks focused node ID", () => {
			const state = createFocusState({ focusedNodeId: "node-123" });
			expect(state.focusedNodeId).toBe("node-123");
		});

		test("supports null focus", () => {
			const state = createFocusState();
			expect(state.focusedNodeId).toBeNull();
		});

		test("maintains focus history stack", () => {
			const state = createFocusState({
				focusedNodeId: "node-3",
				focusHistory: ["node-1", "node-2"],
			});

			expect(state.focusHistory).toEqual(["node-1", "node-2"]);
		});
	});
});
