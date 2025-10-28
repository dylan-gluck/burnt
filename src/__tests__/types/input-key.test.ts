/**
 * Unit tests for Key type
 *
 * Tests the Key type structure, modifier combinations, and key name support.
 */

import { describe, expect, test } from "bun:test";
import type { Key } from "../../types/input.js";

const createKey = (overrides: Partial<Key> = {}): Key => ({
	name: "a",
	sequence: "a",
	ctrl: false,
	meta: false,
	shift: false,
	...overrides,
});

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
});
