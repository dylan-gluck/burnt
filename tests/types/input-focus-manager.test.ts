/**
 * Unit tests for FocusManager type
 *
 * Tests the FocusManager interface, focus navigation, and node management.
 */

import { describe, expect, test } from "bun:test";
import type { FocusManager } from "../../src/types/input.js";

const createFocusManager = (nodes: string[]): FocusManager => {
	let currentIndex = 0;

	return {
		getFocusedNode: () =>
			currentIndex >= 0 && currentIndex < nodes.length
				? nodes[currentIndex]
				: null,
		setFocus: (nodeId: string) => {
			currentIndex = nodes.indexOf(nodeId);
		},
		moveFocusNext: () => {
			currentIndex = (currentIndex + 1) % nodes.length;
		},
		moveFocusPrevious: () => {
			currentIndex = currentIndex === 0 ? nodes.length - 1 : currentIndex - 1;
		},
		clearFocus: () => {
			currentIndex = -1;
		},
	};
};

describe("Input Types", () => {
	describe("FocusManager", () => {
		const testNodes = ["node-1", "node-2", "node-3"];

		test.each([
			[
				"getFocusedNode returns first node",
				(m: FocusManager) => expect(m.getFocusedNode()).toBe("node-1"),
			],
			[
				"setFocus changes focused node",
				(m: FocusManager) => {
					m.setFocus("node-2");
					expect(m.getFocusedNode()).toBe("node-2");
				},
			],
			[
				"clearFocus sets focus to null",
				(m: FocusManager) => {
					m.clearFocus();
					expect(m.getFocusedNode()).toBeNull();
				},
			],
		])("%s", (_desc, testFn) => {
			const manager = createFocusManager(testNodes);
			testFn(manager);
		});

		test("moveFocusNext cycles forward through nodes", () => {
			const manager = createFocusManager(testNodes);
			const expected = ["node-1", "node-2", "node-3", "node-1"];

			for (const node of expected) {
				expect(manager.getFocusedNode()).toBe(node);
				manager.moveFocusNext();
			}
		});

		test("moveFocusPrevious cycles backward through nodes", () => {
			const manager = createFocusManager(testNodes);
			const expected = ["node-1", "node-3", "node-2", "node-1"];

			for (const node of expected) {
				expect(manager.getFocusedNode()).toBe(node);
				manager.moveFocusPrevious();
			}
		});
	});
});
