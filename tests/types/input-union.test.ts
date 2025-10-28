/**
 * Unit tests for InputEvent union type
 *
 * Tests the InputEvent union type, type discrimination, and event stream handling.
 */

import { describe, expect, test } from "bun:test";
import type {
	InputEvent,
	Key,
	KeyModifiers,
	KeyPress,
	MouseEvent,
	ResizeEvent,
} from "../../src/types/input.js";

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

describe("Input Types", () => {
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
});
