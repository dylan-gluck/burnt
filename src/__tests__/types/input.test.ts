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

describe("Input Types", () => {
	describe("Key", () => {
		test("should define key with all properties", () => {
			const key: Key = {
				name: "enter",
				sequence: "\r",
				ctrl: false,
				meta: false,
				shift: false,
			};

			expect(key.name).toBe("enter");
			expect(key.sequence).toBe("\r");
			expect(key.ctrl).toBe(false);
			expect(key.meta).toBe(false);
			expect(key.shift).toBe(false);
		});

		test("should support letter keys", () => {
			const letterA: Key = {
				name: "a",
				sequence: "a",
				ctrl: false,
				meta: false,
				shift: false,
			};

			expect(letterA.name).toBe("a");
		});

		test("should support special keys", () => {
			const upArrow: Key = {
				name: "up",
				sequence: "\x1b[A",
				ctrl: false,
				meta: false,
				shift: false,
			};

			const escapeKey: Key = {
				name: "escape",
				sequence: "\x1b",
				ctrl: false,
				meta: false,
				shift: false,
			};

			expect(upArrow.name).toBe("up");
			expect(escapeKey.name).toBe("escape");
		});

		test("should support modifier combinations", () => {
			const ctrlC: Key = {
				name: "c",
				sequence: "\x03",
				ctrl: true,
				meta: false,
				shift: false,
			};

			const shiftTab: Key = {
				name: "tab",
				sequence: "\x1b[Z",
				ctrl: false,
				meta: false,
				shift: true,
			};

			expect(ctrlC.ctrl).toBe(true);
			expect(shiftTab.shift).toBe(true);
		});
	});

	describe("KeyModifiers", () => {
		test("should define all modifier flags", () => {
			const modifiers: KeyModifiers = {
				ctrl: false,
				alt: false,
				shift: false,
				meta: false,
			};

			expect(modifiers).toEqual({
				ctrl: false,
				alt: false,
				shift: false,
				meta: false,
			});
		});

		test("should support single modifier", () => {
			const ctrlOnly: KeyModifiers = {
				ctrl: true,
				alt: false,
				shift: false,
				meta: false,
			};

			expect(ctrlOnly.ctrl).toBe(true);
			expect(ctrlOnly.alt).toBe(false);
		});

		test("should support multiple modifiers", () => {
			const ctrlShift: KeyModifiers = {
				ctrl: true,
				alt: false,
				shift: true,
				meta: false,
			};

			expect(ctrlShift.ctrl).toBe(true);
			expect(ctrlShift.shift).toBe(true);
		});

		test("should support all modifiers", () => {
			const allMods: KeyModifiers = {
				ctrl: true,
				alt: true,
				shift: true,
				meta: true,
			};

			expect(allMods.ctrl).toBe(true);
			expect(allMods.alt).toBe(true);
			expect(allMods.shift).toBe(true);
			expect(allMods.meta).toBe(true);
		});
	});

	describe("KeyPress", () => {
		test("should have type discriminator and key info", () => {
			const keyPress: KeyPress = {
				type: "keypress",
				key: {
					name: "a",
					sequence: "a",
					ctrl: false,
					meta: false,
					shift: false,
				},
				modifiers: {
					ctrl: false,
					alt: false,
					shift: false,
					meta: false,
				},
			};

			expect(keyPress.type).toBe("keypress");
			expect(keyPress.key.name).toBe("a");
		});

		test("should support Ctrl+C", () => {
			const ctrlC: KeyPress = {
				type: "keypress",
				key: {
					name: "c",
					sequence: "\x03",
					ctrl: true,
					meta: false,
					shift: false,
				},
				modifiers: {
					ctrl: true,
					alt: false,
					shift: false,
					meta: false,
				},
			};

			expect(ctrlC.key.ctrl).toBe(true);
			expect(ctrlC.modifiers.ctrl).toBe(true);
		});

		test("should support arrow keys", () => {
			const upArrow: KeyPress = {
				type: "keypress",
				key: {
					name: "up",
					sequence: "\x1b[A",
					ctrl: false,
					meta: false,
					shift: false,
				},
				modifiers: {
					ctrl: false,
					alt: false,
					shift: false,
					meta: false,
				},
			};

			expect(upArrow.key.name).toBe("up");
		});

		test("should support function keys", () => {
			const f1: KeyPress = {
				type: "keypress",
				key: {
					name: "f1",
					sequence: "\x1bOP",
					ctrl: false,
					meta: false,
					shift: false,
				},
				modifiers: {
					ctrl: false,
					alt: false,
					shift: false,
					meta: false,
				},
			};

			expect(f1.key.name).toBe("f1");
		});
	});

	describe("MouseEvent", () => {
		test("should have type discriminator and position", () => {
			const mouseEvent: MouseEvent = {
				type: "mouse",
				x: 10,
				y: 5,
				button: "left",
				action: "press",
			};

			expect(mouseEvent.type).toBe("mouse");
			expect(mouseEvent.x).toBe(10);
			expect(mouseEvent.y).toBe(5);
			expect(mouseEvent.button).toBe("left");
			expect(mouseEvent.action).toBe("press");
		});

		test("should support all button types", () => {
			const buttons: MouseEvent["button"][] = [
				"left",
				"right",
				"middle",
				"wheelUp",
				"wheelDown",
			];

			for (const button of buttons) {
				const event: MouseEvent = {
					type: "mouse",
					x: 0,
					y: 0,
					button,
					action: "press",
				};

				expect(event.button).toBe(button);
			}
		});

		test("should support all action types", () => {
			const actions: MouseEvent["action"][] = ["press", "release", "move"];

			for (const action of actions) {
				const event: MouseEvent = {
					type: "mouse",
					x: 0,
					y: 0,
					button: "left",
					action,
				};

				expect(event.action).toBe(action);
			}
		});

		test("should support mouse drag (move events)", () => {
			const dragStart: MouseEvent = {
				type: "mouse",
				x: 10,
				y: 5,
				button: "left",
				action: "press",
			};

			const dragMove: MouseEvent = {
				type: "mouse",
				x: 15,
				y: 8,
				button: "left",
				action: "move",
			};

			const dragEnd: MouseEvent = {
				type: "mouse",
				x: 20,
				y: 10,
				button: "left",
				action: "release",
			};

			expect(dragStart.action).toBe("press");
			expect(dragMove.action).toBe("move");
			expect(dragEnd.action).toBe("release");
		});

		test("should support scroll events", () => {
			const scrollUp: MouseEvent = {
				type: "mouse",
				x: 40,
				y: 12,
				button: "wheelUp",
				action: "press",
			};

			const scrollDown: MouseEvent = {
				type: "mouse",
				x: 40,
				y: 12,
				button: "wheelDown",
				action: "press",
			};

			expect(scrollUp.button).toBe("wheelUp");
			expect(scrollDown.button).toBe("wheelDown");
		});
	});

	describe("ResizeEvent", () => {
		test("should have type discriminator and dimensions", () => {
			const resize: ResizeEvent = {
				type: "resize",
				width: 120,
				height: 40,
			};

			expect(resize.type).toBe("resize");
			expect(resize.width).toBe(120);
			expect(resize.height).toBe(40);
		});

		test("should support standard terminal sizes", () => {
			const standard80x24: ResizeEvent = {
				type: "resize",
				width: 80,
				height: 24,
			};

			const widescreen: ResizeEvent = {
				type: "resize",
				width: 200,
				height: 60,
			};

			expect(standard80x24.width).toBe(80);
			expect(standard80x24.height).toBe(24);
			expect(widescreen.width).toBe(200);
			expect(widescreen.height).toBe(60);
		});

		test("should support small terminal sizes", () => {
			const small: ResizeEvent = {
				type: "resize",
				width: 40,
				height: 10,
			};

			expect(small.width).toBe(40);
			expect(small.height).toBe(10);
		});
	});

	describe("InputEvent (Union Type)", () => {
		test("should accept KeyPress events", () => {
			const event: InputEvent = {
				type: "keypress",
				key: {
					name: "a",
					sequence: "a",
					ctrl: false,
					meta: false,
					shift: false,
				},
				modifiers: {
					ctrl: false,
					alt: false,
					shift: false,
					meta: false,
				},
			};

			expect(event.type).toBe("keypress");
		});

		test("should accept MouseEvent events", () => {
			const event: InputEvent = {
				type: "mouse",
				x: 10,
				y: 5,
				button: "left",
				action: "press",
			};

			expect(event.type).toBe("mouse");
		});

		test("should accept ResizeEvent events", () => {
			const event: InputEvent = {
				type: "resize",
				width: 80,
				height: 24,
			};

			expect(event.type).toBe("resize");
		});

		test("should support type-based discrimination", () => {
			const events: InputEvent[] = [
				{
					type: "keypress",
					key: {
						name: "a",
						sequence: "a",
						ctrl: false,
						meta: false,
						shift: false,
					},
					modifiers: { ctrl: false, alt: false, shift: false, meta: false },
				},
				{ type: "mouse", x: 10, y: 5, button: "left", action: "press" },
				{ type: "resize", width: 80, height: 24 },
			];

			const keypresses = events.filter((e) => e.type === "keypress");
			const mouseEvents = events.filter((e) => e.type === "mouse");
			const resizeEvents = events.filter((e) => e.type === "resize");

			expect(keypresses.length).toBe(1);
			expect(mouseEvents.length).toBe(1);
			expect(resizeEvents.length).toBe(1);
		});
	});

	describe("FocusState", () => {
		test("should track focused node ID", () => {
			const state: FocusState = {
				focusedNodeId: "node-123",
				focusHistory: [],
			};

			expect(state.focusedNodeId).toBe("node-123");
		});

		test("should support null focus (no node focused)", () => {
			const noFocus: FocusState = {
				focusedNodeId: null,
				focusHistory: [],
			};

			expect(noFocus.focusedNodeId).toBeNull();
		});

		test("should maintain focus history stack", () => {
			const state: FocusState = {
				focusedNodeId: "node-3",
				focusHistory: ["node-1", "node-2"],
			};

			expect(state.focusHistory.length).toBe(2);
			expect(state.focusHistory[0]).toBe("node-1");
			expect(state.focusHistory[1]).toBe("node-2");
		});

		test("should support empty focus history", () => {
			const state: FocusState = {
				focusedNodeId: "node-1",
				focusHistory: [],
			};

			expect(state.focusHistory.length).toBe(0);
		});
	});

	describe("FocusManager", () => {
		test("should implement getFocusedNode method", () => {
			const manager: FocusManager = {
				getFocusedNode: () => "node-123",
				setFocus: () => {},
				moveFocusNext: () => {},
				moveFocusPrevious: () => {},
				clearFocus: () => {},
			};

			const focusedNode = manager.getFocusedNode();
			expect(focusedNode).toBe("node-123");
		});

		test("should implement setFocus method", () => {
			let currentFocus: string | null = null;

			const manager: FocusManager = {
				getFocusedNode: () => currentFocus,
				setFocus: (nodeId: string) => {
					currentFocus = nodeId;
				},
				moveFocusNext: () => {},
				moveFocusPrevious: () => {},
				clearFocus: () => {},
			};

			manager.setFocus("node-456");
			expect(manager.getFocusedNode()).toBe("node-456");
		});

		test("should implement moveFocusNext method", () => {
			const focusableNodes = ["node-1", "node-2", "node-3"];
			let currentIndex = 0;

			const manager: FocusManager = {
				getFocusedNode: () => focusableNodes[currentIndex],
				setFocus: (nodeId: string) => {
					currentIndex = focusableNodes.indexOf(nodeId);
				},
				moveFocusNext: () => {
					currentIndex = (currentIndex + 1) % focusableNodes.length;
				},
				moveFocusPrevious: () => {},
				clearFocus: () => {},
			};

			expect(manager.getFocusedNode()).toBe("node-1");
			manager.moveFocusNext();
			expect(manager.getFocusedNode()).toBe("node-2");
			manager.moveFocusNext();
			expect(manager.getFocusedNode()).toBe("node-3");
		});

		test("should implement moveFocusPrevious method", () => {
			const focusableNodes = ["node-1", "node-2", "node-3"];
			let currentIndex = 2;

			const manager: FocusManager = {
				getFocusedNode: () => focusableNodes[currentIndex],
				setFocus: (nodeId: string) => {
					currentIndex = focusableNodes.indexOf(nodeId);
				},
				moveFocusNext: () => {},
				moveFocusPrevious: () => {
					currentIndex =
						currentIndex === 0 ? focusableNodes.length - 1 : currentIndex - 1;
				},
				clearFocus: () => {},
			};

			expect(manager.getFocusedNode()).toBe("node-3");
			manager.moveFocusPrevious();
			expect(manager.getFocusedNode()).toBe("node-2");
			manager.moveFocusPrevious();
			expect(manager.getFocusedNode()).toBe("node-1");
		});

		test("should implement clearFocus method", () => {
			let currentFocus: string | null = "node-123";

			const manager: FocusManager = {
				getFocusedNode: () => currentFocus,
				setFocus: (nodeId: string) => {
					currentFocus = nodeId;
				},
				moveFocusNext: () => {},
				moveFocusPrevious: () => {},
				clearFocus: () => {
					currentFocus = null;
				},
			};

			expect(manager.getFocusedNode()).toBe("node-123");
			manager.clearFocus();
			expect(manager.getFocusedNode()).toBeNull();
		});

		test("should support focus cycling", () => {
			const focusableNodes = ["input-1", "button-1", "input-2"];
			let currentIndex = 0;

			const manager: FocusManager = {
				getFocusedNode: () =>
					currentIndex < 0 || currentIndex >= focusableNodes.length
						? null
						: focusableNodes[currentIndex],
				setFocus: (nodeId: string) => {
					currentIndex = focusableNodes.indexOf(nodeId);
				},
				moveFocusNext: () => {
					currentIndex = (currentIndex + 1) % focusableNodes.length;
				},
				moveFocusPrevious: () => {
					currentIndex =
						currentIndex === 0 ? focusableNodes.length - 1 : currentIndex - 1;
				},
				clearFocus: () => {
					currentIndex = -1;
				},
			};

			// Forward cycle
			expect(manager.getFocusedNode()).toBe("input-1");
			manager.moveFocusNext();
			expect(manager.getFocusedNode()).toBe("button-1");
			manager.moveFocusNext();
			expect(manager.getFocusedNode()).toBe("input-2");
			manager.moveFocusNext(); // Wrap around
			expect(manager.getFocusedNode()).toBe("input-1");

			// Backward cycle
			manager.moveFocusPrevious(); // Wrap around
			expect(manager.getFocusedNode()).toBe("input-2");
			manager.moveFocusPrevious();
			expect(manager.getFocusedNode()).toBe("button-1");
		});
	});

	describe("Type Composition", () => {
		test("should compose Key into KeyPress", () => {
			const key: Key = {
				name: "enter",
				sequence: "\r",
				ctrl: false,
				meta: false,
				shift: false,
			};

			const keyPress: KeyPress = {
				type: "keypress",
				key,
				modifiers: {
					ctrl: false,
					alt: false,
					shift: false,
					meta: false,
				},
			};

			expect(keyPress.key).toEqual(key);
		});

		test("should compose KeyModifiers into KeyPress", () => {
			const modifiers: KeyModifiers = {
				ctrl: true,
				alt: false,
				shift: false,
				meta: false,
			};

			const keyPress: KeyPress = {
				type: "keypress",
				key: {
					name: "c",
					sequence: "\x03",
					ctrl: true,
					meta: false,
					shift: false,
				},
				modifiers,
			};

			expect(keyPress.modifiers).toEqual(modifiers);
		});

		test("should support event stream simulation", () => {
			const eventStream: InputEvent[] = [
				{
					type: "keypress",
					key: {
						name: "h",
						sequence: "h",
						ctrl: false,
						meta: false,
						shift: false,
					},
					modifiers: { ctrl: false, alt: false, shift: false, meta: false },
				},
				{
					type: "keypress",
					key: {
						name: "i",
						sequence: "i",
						ctrl: false,
						meta: false,
						shift: false,
					},
					modifiers: { ctrl: false, alt: false, shift: false, meta: false },
				},
				{ type: "mouse", x: 10, y: 5, button: "left", action: "press" },
				{ type: "resize", width: 120, height: 40 },
			];

			expect(eventStream.length).toBe(4);
			expect(eventStream[0].type).toBe("keypress");
			expect(eventStream[2].type).toBe("mouse");
			expect(eventStream[3].type).toBe("resize");
		});
	});
});
