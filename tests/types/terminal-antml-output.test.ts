/**
 * Unit tests for ANTMLOutput type
 *
 * Tests ANTML (ANSI Terminal Markup Language) output type which represents
 * terminal output with ANSI escape sequences for styling and formatting.
 */

import { describe, expect, test } from "bun:test";
import type { ANTMLOutput } from "../../src/types/terminal.js";

describe("ANTMLOutput", () => {
	test("should have type discriminator and content", () => {
		const output: ANTMLOutput = {
			type: "antml",
			content: "\x1b[1mBold text\x1b[0m",
		};

		expect(output.type).toBe("antml");
		expect(output.content).toContain("Bold text");
	});

	test("should support empty content", () => {
		const empty: ANTMLOutput = {
			type: "antml",
			content: "",
		};

		expect(empty.content).toBe("");
	});

	test("should support ANSI escape sequences", () => {
		const ansiOutput: ANTMLOutput = {
			type: "antml",
			content:
				"\x1b[38;2;255;0;0mRed text\x1b[0m\n\x1b[38;2;0;255;0mGreen text\x1b[0m",
		};

		expect(ansiOutput.content).toContain("\x1b[38;2;255;0;0m");
		expect(ansiOutput.content).toContain("Red text");
	});
});
