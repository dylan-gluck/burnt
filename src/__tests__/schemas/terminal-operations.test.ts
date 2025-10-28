/**
 * Tests for Output Operation and Diff Schemas
 *
 * Tests validation of output operations (insert, delete, update) and diffs.
 */

import { describe, expect, test } from "bun:test";
import {
	decodeOutputDiff,
	decodeOutputOperation,
} from "../../schemas/terminal.js";

// ============================================================================
// OutputOperation Schema Tests
// ============================================================================

describe("OutputOperationSchema", () => {
	test("accepts insert operation", () => {
		const operation = {
			type: "insert",
			lineIndex: 0,
			newLine: {
				segments: [{ text: "New line", style: {} }],
			},
		};
		expect(() => decodeOutputOperation(operation)).not.toThrow();
	});

	test("accepts delete operation", () => {
		const operation = {
			type: "delete",
			lineIndex: 5,
			oldLine: {
				segments: [{ text: "Old line", style: {} }],
			},
		};
		expect(() => decodeOutputOperation(operation)).not.toThrow();
	});

	test("accepts update operation", () => {
		const operation = {
			type: "update",
			lineIndex: 10,
			oldLine: {
				segments: [{ text: "Old", style: {} }],
			},
			newLine: {
				segments: [{ text: "New", style: {} }],
			},
		};
		expect(() => decodeOutputOperation(operation)).not.toThrow();
	});

	test("rejects negative lineIndex", () => {
		const operation = {
			type: "insert",
			lineIndex: -1,
			newLine: {
				segments: [{ text: "New", style: {} }],
			},
		};
		expect(() => decodeOutputOperation(operation)).toThrow();
	});

	test("rejects non-integer lineIndex", () => {
		const operation = {
			type: "insert",
			lineIndex: 1.5,
			newLine: {
				segments: [{ text: "New", style: {} }],
			},
		};
		expect(() => decodeOutputOperation(operation)).toThrow();
	});

	test("rejects invalid operation type", () => {
		const operation = {
			type: "invalid",
			lineIndex: 0,
		};
		expect(() => decodeOutputOperation(operation)).toThrow();
	});
});

// ============================================================================
// OutputDiff Schema Tests
// ============================================================================

describe("OutputDiffSchema", () => {
	test("accepts empty diff", () => {
		const diff = {
			operations: [],
		};
		expect(() => decodeOutputDiff(diff)).not.toThrow();
	});

	test("accepts diff with single operation", () => {
		const diff = {
			operations: [
				{
					type: "insert",
					lineIndex: 0,
					newLine: {
						segments: [{ text: "New", style: {} }],
					},
				},
			],
		};
		expect(() => decodeOutputDiff(diff)).not.toThrow();
	});

	test("accepts diff with multiple operations", () => {
		const diff = {
			operations: [
				{
					type: "insert",
					lineIndex: 0,
					newLine: {
						segments: [{ text: "Insert", style: {} }],
					},
				},
				{
					type: "delete",
					lineIndex: 5,
					oldLine: {
						segments: [{ text: "Delete", style: {} }],
					},
				},
				{
					type: "update",
					lineIndex: 10,
					oldLine: {
						segments: [{ text: "Old", style: {} }],
					},
					newLine: {
						segments: [{ text: "New", style: {} }],
					},
				},
			],
		};
		expect(() => decodeOutputDiff(diff)).not.toThrow();
	});

	test("rejects missing operations", () => {
		const diff = {};
		expect(() => decodeOutputDiff(diff)).toThrow();
	});

	test("rejects invalid operation in array", () => {
		const diff = {
			operations: [
				{
					type: "invalid",
					lineIndex: 0,
				},
			],
		};
		expect(() => decodeOutputDiff(diff)).toThrow();
	});
});
