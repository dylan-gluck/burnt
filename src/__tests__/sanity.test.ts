/**
 * Sanity tests for project infrastructure
 *
 * These tests verify that the basic project setup is working correctly.
 */

import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import * as index from "../index";
import { runTestEffect } from "./helpers";

describe("Project Infrastructure", () => {
	it("should export version", () => {
		expect(index.version).toBeDefined();
		expect(typeof index.version).toBe("string");
	});

	it("should export ready flag", () => {
		expect(index.ready).toBe(true);
	});
});

describe("Effect Test Helpers", () => {
	it("should run a simple Effect program", async () => {
		const program = Effect.succeed(42);
		const result = await runTestEffect(program);
		expect(result).toBe(42);
	});

	it("should handle Effect.gen programs", async () => {
		const program = Effect.gen(function* () {
			const a = yield* Effect.succeed(10);
			const b = yield* Effect.succeed(20);
			return a + b;
		});

		const result = await runTestEffect(program);
		expect(result).toBe(30);
	});

	it("should propagate errors correctly", async () => {
		const program = Effect.fail("test error");

		await expect(runTestEffect(program)).rejects.toThrow();
	});
});
