/**
 * Unit tests for MouseEvent type
 *
 * Tests the MouseEvent type structure, button types, actions, and mouse interaction sequences.
 */

import { describe, expect, test } from "bun:test";
import type { MouseEvent } from "../../src/types/input.js";

const createMouseEvent = (
	overrides: Partial<Omit<MouseEvent, "type">> = {}
): MouseEvent => ({
	type: "mouse",
	x: 0,
	y: 0,
	button: "left",
	action: "press",
	...overrides,
});

describe("Input Types", () => {
	describe("MouseEvent", () => {
		test("has type discriminator and position", () => {
			const event = createMouseEvent({ x: 10, y: 5 });
			expect(event.type).toBe("mouse");
			expect(event.x).toBe(10);
			expect(event.y).toBe(5);
		});

		test.each<MouseEvent["button"]>([
			"left",
			"right",
			"middle",
			"wheelUp",
			"wheelDown",
		])("supports button type: %s", (button) => {
			const event = createMouseEvent({ button });
			expect(event.button).toBe(button);
		});

		test.each<MouseEvent["action"]>(["press", "release", "move"])(
			"supports action type: %s",
			(action) => {
				const event = createMouseEvent({ action });
				expect(event.action).toBe(action);
			}
		);

		test("supports mouse drag and scroll sequences", () => {
			const dragSequence = [
				createMouseEvent({ x: 10, y: 5, action: "press" }),
				createMouseEvent({ x: 15, y: 8, action: "move" }),
				createMouseEvent({ x: 20, y: 10, action: "release" }),
			];
			expect(dragSequence.map((e) => e.action)).toEqual([
				"press",
				"move",
				"release",
			]);

			const scrollUp = createMouseEvent({ button: "wheelUp" });
			const scrollDown = createMouseEvent({ button: "wheelDown" });
			expect([scrollUp.button, scrollDown.button]).toEqual([
				"wheelUp",
				"wheelDown",
			]);
		});
	});
});
