/**
 * Unit tests for OutputDiff type
 *
 * Tests output diffs which represent a collection of operations that transform
 * one terminal buffer state to another. Used for incremental rendering updates.
 */

import { describe, expect, test } from "bun:test";
import type { OutputDiff } from "../../types/terminal.js";

describe("OutputDiff", () => {
	test("should contain array of operations", () => {
		const diff: OutputDiff = {
			operations: [
				{
					type: "insert",
					lineIndex: 0,
					newLine: { segments: [{ text: "Line 1", style: {} }] },
				},
				{
					type: "insert",
					lineIndex: 1,
					newLine: { segments: [{ text: "Line 2", style: {} }] },
				},
			],
		};

		expect(diff.operations.length).toBe(2);
		expect(diff.operations[0].type).toBe("insert");
		expect(diff.operations[1].type).toBe("insert");
	});

	test("should support empty diff (no changes)", () => {
		const noDiff: OutputDiff = {
			operations: [],
		};

		expect(noDiff.operations.length).toBe(0);
	});

	test("should support mixed operations", () => {
		const mixedDiff: OutputDiff = {
			operations: [
				{
					type: "delete",
					lineIndex: 0,
					oldLine: { segments: [{ text: "Removed", style: {} }] },
				},
				{
					type: "insert",
					lineIndex: 0,
					newLine: { segments: [{ text: "Added", style: {} }] },
				},
				{
					type: "update",
					lineIndex: 1,
					oldLine: { segments: [{ text: "Old", style: {} }] },
					newLine: { segments: [{ text: "New", style: {} }] },
				},
			],
		};

		expect(mixedDiff.operations.length).toBe(3);
		expect(mixedDiff.operations[0].type).toBe("delete");
		expect(mixedDiff.operations[1].type).toBe("insert");
		expect(mixedDiff.operations[2].type).toBe("update");
	});
});
