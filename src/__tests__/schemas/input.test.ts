/**
 * Tests for Input Event Schemas
 *
 * Tests validation of keyboard events, mouse events, resize events, and focus state.
 */

import { describe, expect, test } from "bun:test";
import {
	decodeFocusState,
	decodeInputEvent,
	decodeKey,
	decodeKeyModifiers,
	decodeKeyPress,
	decodeMouseEvent,
	decodeResizeEvent,
} from "../../schemas/input.js";

// ============================================================================
// Key Schema Tests
// ============================================================================

describe("KeySchema", () => {
	test("accepts valid key", () => {
		const key = {
			name: "a",
			sequence: "a",
			ctrl: false,
			meta: false,
			shift: false,
		};
		expect(() => decodeKey(key)).not.toThrow();
	});

	test("accepts special key names", () => {
		const keys = [
			"enter",
			"escape",
			"tab",
			"space",
			"up",
			"down",
			"left",
			"right",
		];
		for (const name of keys) {
			const key = {
				name,
				sequence: "\x1b[A",
				ctrl: false,
				meta: false,
				shift: false,
			};
			expect(() => decodeKey(key)).not.toThrow();
		}
	});

	test("accepts key with modifiers", () => {
		const key = {
			name: "c",
			sequence: "\x03",
			ctrl: true,
			meta: false,
			shift: false,
		};
		expect(() => decodeKey(key)).not.toThrow();
	});

	test("accepts key with all modifiers", () => {
		const key = {
			name: "a",
			sequence: "a",
			ctrl: true,
			meta: true,
			shift: true,
		};
		expect(() => decodeKey(key)).not.toThrow();
	});

	test("rejects empty name", () => {
		const key = {
			name: "",
			sequence: "a",
			ctrl: false,
			meta: false,
			shift: false,
		};
		expect(() => decodeKey(key)).toThrow();
	});

	test("rejects non-boolean ctrl", () => {
		const key = {
			name: "a",
			sequence: "a",
			ctrl: "yes",
			meta: false,
			shift: false,
		};
		expect(() => decodeKey(key)).toThrow();
	});

	test("rejects missing fields", () => {
		const key = {
			name: "a",
			sequence: "a",
			// Missing ctrl, meta, shift
		};
		expect(() => decodeKey(key)).toThrow();
	});
});

// ============================================================================
// KeyModifiers Schema Tests
// ============================================================================

describe("KeyModifiersSchema", () => {
	test("accepts no modifiers", () => {
		const modifiers = {
			ctrl: false,
			alt: false,
			shift: false,
			meta: false,
		};
		expect(() => decodeKeyModifiers(modifiers)).not.toThrow();
	});

	test("accepts ctrl modifier", () => {
		const modifiers = {
			ctrl: true,
			alt: false,
			shift: false,
			meta: false,
		};
		expect(() => decodeKeyModifiers(modifiers)).not.toThrow();
	});

	test("accepts all modifiers", () => {
		const modifiers = {
			ctrl: true,
			alt: true,
			shift: true,
			meta: true,
		};
		expect(() => decodeKeyModifiers(modifiers)).not.toThrow();
	});

	test("rejects non-boolean values", () => {
		const modifiers = {
			ctrl: "yes",
			alt: false,
			shift: false,
			meta: false,
		};
		expect(() => decodeKeyModifiers(modifiers)).toThrow();
	});

	test("rejects missing fields", () => {
		const modifiers = {
			ctrl: true,
			alt: false,
			// Missing shift and meta
		};
		expect(() => decodeKeyModifiers(modifiers)).toThrow();
	});
});

// ============================================================================
// KeyPress Event Schema Tests
// ============================================================================

describe("KeyPressSchema", () => {
	test("accepts valid keypress event", () => {
		const event = {
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
		expect(() => decodeKeyPress(event)).not.toThrow();
	});

	test("accepts keypress with Ctrl+C", () => {
		const event = {
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
		expect(() => decodeKeyPress(event)).not.toThrow();
	});

	test("rejects wrong event type", () => {
		const event = {
			type: "invalid",
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
		expect(() => decodeKeyPress(event)).toThrow();
	});

	test("rejects invalid key", () => {
		const event = {
			type: "keypress",
			key: {
				name: "", // Invalid empty name
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
		expect(() => decodeKeyPress(event)).toThrow();
	});

	test("rejects missing modifiers", () => {
		const event = {
			type: "keypress",
			key: {
				name: "a",
				sequence: "a",
				ctrl: false,
				meta: false,
				shift: false,
			},
		};
		expect(() => decodeKeyPress(event)).toThrow();
	});
});

// ============================================================================
// Mouse Event Schema Tests
// ============================================================================

describe("MouseEventSchema", () => {
	test("accepts valid mouse press event", () => {
		const event = {
			type: "mouse",
			x: 10,
			y: 20,
			button: "left",
			action: "press",
		};
		expect(() => decodeMouseEvent(event)).not.toThrow();
	});

	test("accepts mouse release event", () => {
		const event = {
			type: "mouse",
			x: 0,
			y: 0,
			button: "left",
			action: "release",
		};
		expect(() => decodeMouseEvent(event)).not.toThrow();
	});

	test("accepts mouse move event", () => {
		const event = {
			type: "mouse",
			x: 50,
			y: 30,
			button: "left",
			action: "move",
		};
		expect(() => decodeMouseEvent(event)).not.toThrow();
	});

	test("accepts all button types", () => {
		const buttons = ["left", "right", "middle", "wheelUp", "wheelDown"];
		for (const button of buttons) {
			const event = {
				type: "mouse",
				x: 0,
				y: 0,
				button,
				action: "press",
			};
			expect(() => decodeMouseEvent(event)).not.toThrow();
		}
	});

	test("accepts all action types", () => {
		const actions = ["press", "release", "move"];
		for (const action of actions) {
			const event = {
				type: "mouse",
				x: 0,
				y: 0,
				button: "left",
				action,
			};
			expect(() => decodeMouseEvent(event)).not.toThrow();
		}
	});

	test("rejects negative x coordinate", () => {
		const event = {
			type: "mouse",
			x: -1,
			y: 0,
			button: "left",
			action: "press",
		};
		expect(() => decodeMouseEvent(event)).toThrow();
	});

	test("rejects negative y coordinate", () => {
		const event = {
			type: "mouse",
			x: 0,
			y: -1,
			button: "left",
			action: "press",
		};
		expect(() => decodeMouseEvent(event)).toThrow();
	});

	test("rejects non-integer coordinates", () => {
		const event = {
			type: "mouse",
			x: 10.5,
			y: 20,
			button: "left",
			action: "press",
		};
		expect(() => decodeMouseEvent(event)).toThrow();
	});

	test("rejects invalid button", () => {
		const event = {
			type: "mouse",
			x: 0,
			y: 0,
			button: "invalid",
			action: "press",
		};
		expect(() => decodeMouseEvent(event)).toThrow();
	});

	test("rejects invalid action", () => {
		const event = {
			type: "mouse",
			x: 0,
			y: 0,
			button: "left",
			action: "invalid",
		};
		expect(() => decodeMouseEvent(event)).toThrow();
	});

	test("rejects wrong event type", () => {
		const event = {
			type: "keypress",
			x: 0,
			y: 0,
			button: "left",
			action: "press",
		};
		expect(() => decodeMouseEvent(event)).toThrow();
	});
});

// ============================================================================
// Resize Event Schema Tests
// ============================================================================

describe("ResizeEventSchema", () => {
	test("accepts valid resize event", () => {
		const event = {
			type: "resize",
			width: 80,
			height: 24,
		};
		expect(() => decodeResizeEvent(event)).not.toThrow();
	});

	test("accepts large terminal dimensions", () => {
		const event = {
			type: "resize",
			width: 300,
			height: 100,
		};
		expect(() => decodeResizeEvent(event)).not.toThrow();
	});

	test("accepts minimum dimensions (1x1)", () => {
		const event = {
			type: "resize",
			width: 1,
			height: 1,
		};
		expect(() => decodeResizeEvent(event)).not.toThrow();
	});

	test("rejects zero width", () => {
		const event = {
			type: "resize",
			width: 0,
			height: 24,
		};
		expect(() => decodeResizeEvent(event)).toThrow();
	});

	test("rejects zero height", () => {
		const event = {
			type: "resize",
			width: 80,
			height: 0,
		};
		expect(() => decodeResizeEvent(event)).toThrow();
	});

	test("rejects negative width", () => {
		const event = {
			type: "resize",
			width: -80,
			height: 24,
		};
		expect(() => decodeResizeEvent(event)).toThrow();
	});

	test("rejects non-integer dimensions", () => {
		const event = {
			type: "resize",
			width: 80.5,
			height: 24,
		};
		expect(() => decodeResizeEvent(event)).toThrow();
	});

	test("rejects wrong event type", () => {
		const event = {
			type: "mouse",
			width: 80,
			height: 24,
		};
		expect(() => decodeResizeEvent(event)).toThrow();
	});
});

// ============================================================================
// InputEvent Union Schema Tests
// ============================================================================

describe("InputEventSchema (Union)", () => {
	test("accepts keypress event via union", () => {
		const event = {
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
		expect(() => decodeInputEvent(event)).not.toThrow();
	});

	test("accepts mouse event via union", () => {
		const event = {
			type: "mouse",
			x: 10,
			y: 20,
			button: "left",
			action: "press",
		};
		expect(() => decodeInputEvent(event)).not.toThrow();
	});

	test("accepts resize event via union", () => {
		const event = {
			type: "resize",
			width: 80,
			height: 24,
		};
		expect(() => decodeInputEvent(event)).not.toThrow();
	});

	test("rejects invalid event type", () => {
		const event = {
			type: "invalid",
			data: {},
		};
		expect(() => decodeInputEvent(event)).toThrow();
	});

	test("rejects event with wrong structure for type", () => {
		const event = {
			type: "keypress",
			// Missing key and modifiers
		};
		expect(() => decodeInputEvent(event)).toThrow();
	});
});

// ============================================================================
// FocusState Schema Tests
// ============================================================================

describe("FocusStateSchema", () => {
	test("accepts focus state with no focus", () => {
		const state = {
			focusedNodeId: null,
			focusHistory: [],
		};
		expect(() => decodeFocusState(state)).not.toThrow();
	});

	test("accepts focus state with focused node", () => {
		const state = {
			focusedNodeId: "node-1",
			focusHistory: [],
		};
		expect(() => decodeFocusState(state)).not.toThrow();
	});

	test("accepts focus state with history", () => {
		const state = {
			focusedNodeId: "node-3",
			focusHistory: ["node-1", "node-2"],
		};
		expect(() => decodeFocusState(state)).not.toThrow();
	});

	test("accepts empty string as focusedNodeId", () => {
		const state = {
			focusedNodeId: "",
			focusHistory: [],
		};
		expect(() => decodeFocusState(state)).not.toThrow();
	});

	test("rejects non-string focusedNodeId", () => {
		const state = {
			focusedNodeId: 123,
			focusHistory: [],
		};
		expect(() => decodeFocusState(state)).toThrow();
	});

	test("rejects non-array focusHistory", () => {
		const state = {
			focusedNodeId: "node-1",
			focusHistory: "node-2",
		};
		expect(() => decodeFocusState(state)).toThrow();
	});

	test("rejects non-string elements in focusHistory", () => {
		const state = {
			focusedNodeId: "node-1",
			focusHistory: ["node-2", 123],
		};
		expect(() => decodeFocusState(state)).toThrow();
	});

	test("rejects missing focusHistory", () => {
		const state = {
			focusedNodeId: "node-1",
		};
		expect(() => decodeFocusState(state)).toThrow();
	});
});
