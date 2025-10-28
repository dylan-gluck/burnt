/**
 * Unit tests for KeyPress type
 *
 * Tests the KeyPress event type structure, type discriminator, and key/modifier combinations.
 */

import { describe, expect, test } from "bun:test";
import type { Key, KeyModifiers, KeyPress } from "../../src/types/input.js";

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

describe("Input Types", () => {
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
});
