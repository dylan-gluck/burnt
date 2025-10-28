/**
 * Unit tests for Input Event Types
 *
 * Tests type structure, composition, and validation for input handling types.
 */

import { describe, expect, test } from "bun:test";
import type {
	FocusManager,
	FocusState,
	InputEvent,
	Key,
	KeyModifiers,
	KeyPress,
	MouseEvent,
	ResizeEvent,
} from "../../types/input.js";

const createKey = (overrides: Partial<Key> = {}): Key => ({
	name: "a",
	sequence: "a",
	ctrl: false,
	meta: false,
	shift: false,
	...overrides,
});

const createModifiers = (
	overrides: Partial<KeyModifiers> = {}
): KeyModifiers => ({
	ctrl: false,
	alt: false,
	shift: false,
	meta: false,
	...overrides,
});

const createKeyPress = (
	keyOverrides: Partial<Key> = {},
	modifierOverrides: Partial<KeyModifiers> = {}
): KeyPress => ({
	type: "keypress",
	key: createKey(keyOverrides),
	modifiers: createModifiers(modifierOverrides),
});

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

const createResizeEvent = (
	overrides: Partial<Omit<ResizeEvent, "type">> = {}
): ResizeEvent => ({
	type: "resize",
	width: 80,
	height: 24,
	...overrides,
});

const createFocusState = (overrides: Partial<FocusState> = {}): FocusState => ({
	focusedNodeId: null,
	focusHistory: [],
	...overrides,
});

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

// Key Tests

describe("Input Types", () => {
	describe("Key", () => {
		test("defines key with all properties", () => {
			const key = createKey({ name: "enter", sequence: "\r" });
			expect(key.name).toBe("enter");
			expect(key.sequence).toBe("\r");
		});

		test.each([
			["a", "a"],
			["enter", "\r"],
			["up", "\x1b[A"],
			["escape", "\x1b"],
		])("supports key name: %s", (name, sequence) => {
			const key = createKey({ name, sequence });
			expect(key.name).toBe(name);
		});

		test("supports modifier combinations", () => {
			const ctrlC = createKey({ name: "c", sequence: "\x03", ctrl: true });
			const shiftTab = createKey({
				name: "tab",
				sequence: "\x1b[Z",
				shift: true,
			});

			expect(ctrlC.ctrl).toBe(true);
			expect(shiftTab.shift).toBe(true);
		});
	});

	// KeyModifiers Tests

	describe("KeyModifiers", () => {
		test("defines all modifier flags", () => {
			const modifiers = createModifiers();
			expect(modifiers).toEqual({
				ctrl: false,
				alt: false,
				shift: false,
				meta: false,
			});
		});

		test.each(["ctrl", "alt", "shift", "meta"])(
			"supports %s modifier",
			(modifier) => {
				const modifiers = createModifiers({ [modifier]: true });
				expect(modifiers[modifier as keyof KeyModifiers]).toBe(true);
			}
		);

		test("supports multiple modifiers", () => {
			const modifiers = createModifiers({ ctrl: true, shift: true });
			expect(modifiers.ctrl).toBe(true);
			expect(modifiers.shift).toBe(true);
		});
	});

	// KeyPress Tests

	describe("KeyPress", () => {
		test("has type discriminator and key info", () => {
			const keyPress = createKeyPress();
			expect(keyPress.type).toBe("keypress");
			expect(keyPress.key).toBeDefined();
			expect(keyPress.modifiers).toBeDefined();
		});

		test.each([
			["Ctrl+C", { name: "c", sequence: "\x03", ctrl: true }, { ctrl: true }],
			["Up Arrow", { name: "up", sequence: "\x1b[A" }, {}],
			["F1", { name: "f1", sequence: "\x1bOP" }, {}],
		])("supports %s", (_label, keyOverrides, modifierOverrides) => {
			const keyPress = createKeyPress(keyOverrides, modifierOverrides);
			expect(keyPress.key.name).toBe(keyOverrides.name);
		});
	});

	// MouseEvent Tests

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

	// ResizeEvent Tests

	describe("ResizeEvent", () => {
		test("has type discriminator and dimensions", () => {
			const resize = createResizeEvent({ width: 120, height: 40 });
			expect(resize.type).toBe("resize");
			expect(resize.width).toBe(120);
			expect(resize.height).toBe(40);
		});

		test.each([
			["standard 80x24", 80, 24],
			["widescreen", 200, 60],
			["small", 40, 10],
		])("supports %s terminal size", (_label, width, height) => {
			const resize = createResizeEvent({ width, height });
			expect(resize.width).toBe(width);
			expect(resize.height).toBe(height);
		});
	});

	// InputEvent Union Tests

	describe("InputEvent (Union Type)", () => {
		test("accepts all event types", () => {
			const events: InputEvent[] = [
				createKeyPress(),
				createMouseEvent(),
				createResizeEvent(),
			];

			expect(events.map((e) => e.type)).toEqual([
				"keypress",
				"mouse",
				"resize",
			]);
		});

		test("supports type-based discrimination", () => {
			const events: InputEvent[] = [
				createKeyPress(),
				createMouseEvent({ x: 10, y: 5 }),
				createResizeEvent(),
			];

			const keypresses = events.filter((e) => e.type === "keypress");
			const mouseEvents = events.filter((e) => e.type === "mouse");
			const resizeEvents = events.filter((e) => e.type === "resize");

			expect([
				keypresses.length,
				mouseEvents.length,
				resizeEvents.length,
			]).toEqual([1, 1, 1]);
		});

		test("supports event stream simulation", () => {
			const eventStream: InputEvent[] = [
				createKeyPress({ name: "h", sequence: "h" }),
				createKeyPress({ name: "i", sequence: "i" }),
				createMouseEvent({ x: 10, y: 5 }),
				createResizeEvent({ width: 120, height: 40 }),
			];

			expect(eventStream).toHaveLength(4);
			expect(eventStream[0].type).toBe("keypress");
			expect(eventStream[2].type).toBe("mouse");
		});
	});

	// FocusState Tests

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

	// FocusManager Tests

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

	// Type Composition Tests

	describe("Type Composition", () => {
		test("composes Key into KeyPress", () => {
			const key = createKey({ name: "enter", sequence: "\r" });
			const keyPress: KeyPress = {
				type: "keypress",
				key,
				modifiers: createModifiers(),
			};

			expect(keyPress.key).toEqual(key);
		});

		test("composes KeyModifiers into KeyPress", () => {
			const modifiers = createModifiers({ ctrl: true });
			const keyPress = createKeyPress(
				{ name: "c", sequence: "\x03", ctrl: true },
				{ ctrl: true }
			);

			expect(keyPress.modifiers.ctrl).toBe(modifiers.ctrl);
		});
	});
});
