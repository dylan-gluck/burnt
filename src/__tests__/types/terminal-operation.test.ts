/**
 * Unit tests for OutputOperation type
 *
 * Tests output operations which represent changes to terminal output buffers.
 * Supports insert, delete, and update operations for line-level modifications.
 */

import { describe, expect, test } from "bun:test";
import type { OutputOperation } from "../../types/terminal.js";

describe("OutputOperation", () => {
	test("should support insert operation", () => {
		const insertOp: OutputOperation = {
			type: "insert",
			lineIndex: 5,
			newLine: {
				segments: [{ text: "New line", style: {} }],
			},
		};

		expect(insertOp.type).toBe("insert");
		expect(insertOp.lineIndex).toBe(5);
		expect(insertOp.newLine).toBeDefined();
		expect(insertOp.oldLine).toBeUndefined();
	});

	test("should support delete operation", () => {
		const deleteOp: OutputOperation = {
			type: "delete",
			lineIndex: 3,
			oldLine: {
				segments: [{ text: "Deleted line", style: {} }],
			},
		};

		expect(deleteOp.type).toBe("delete");
		expect(deleteOp.lineIndex).toBe(3);
		expect(deleteOp.oldLine).toBeDefined();
		expect(deleteOp.newLine).toBeUndefined();
	});

	test("should support update operation", () => {
		const updateOp: OutputOperation = {
			type: "update",
			lineIndex: 10,
			oldLine: {
				segments: [{ text: "Old content", style: {} }],
			},
			newLine: {
				segments: [{ text: "New content", style: { bold: true } }],
			},
		};

		expect(updateOp.type).toBe("update");
		expect(updateOp.lineIndex).toBe(10);
		expect(updateOp.oldLine).toBeDefined();
		expect(updateOp.newLine).toBeDefined();
		expect(updateOp.oldLine?.segments[0].text).toBe("Old content");
		expect(updateOp.newLine?.segments[0].text).toBe("New content");
	});
});
