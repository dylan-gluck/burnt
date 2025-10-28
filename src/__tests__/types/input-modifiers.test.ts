/**
 * Unit tests for KeyModifiers type
 *
 * Tests the KeyModifiers type structure and all modifier flag combinations.
 */

import { describe, expect, test } from "bun:test";
import type { KeyModifiers } from "../../types/input.js";

const createModifiers = (
	overrides: Partial<KeyModifiers> = {}
): KeyModifiers => ({
	ctrl: false,
	alt: false,
	shift: false,
	meta: false,
	...overrides,
});

describe("Input Types", () => {
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
});
