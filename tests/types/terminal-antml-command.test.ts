/**
 * Unit tests for ANTMLCommand type
 *
 * Tests ANTML command types which represent terminal control commands like
 * clear, flush, and exit. Commands can include optional payloads.
 */

import { describe, expect, test } from "bun:test";
import type { ANTMLCommand } from "../../src/types/terminal.js";

describe("ANTMLCommand", () => {
	test("should support clear command", () => {
		const clearCmd: ANTMLCommand = {
			type: "clear",
		};

		expect(clearCmd.type).toBe("clear");
		expect(clearCmd.payload).toBeUndefined();
	});

	test("should support flush command", () => {
		const flushCmd: ANTMLCommand = {
			type: "flush",
		};

		expect(flushCmd.type).toBe("flush");
	});

	test("should support exit command", () => {
		const exitCmd: ANTMLCommand = {
			type: "exit",
		};

		expect(exitCmd.type).toBe("exit");
	});

	test("should support optional payload", () => {
		const cmdWithPayload: ANTMLCommand = {
			type: "clear",
			payload: { lines: 10 },
		};

		expect(cmdWithPayload.payload).toEqual({ lines: 10 });
	});
});
