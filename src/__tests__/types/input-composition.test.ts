/**
 * Unit tests for Input Type Composition
 *
 * Tests how Key, KeyModifiers, and KeyPress types compose together.
 */

import { describe, expect, test } from "bun:test";
import type { Key, KeyModifiers, KeyPress } from "../../types/input.js";

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
