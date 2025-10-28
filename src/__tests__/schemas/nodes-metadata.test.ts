/**
 * Tests for NodeMetadata Schema
 *
 * Tests validation of node metadata including key, fiberNode, and state flags.
 */

import { describe, expect, test } from "bun:test";
import { decodeNodeMetadata } from "../../schemas/nodes.js";

describe("NodeMetadataSchema", () => {
	test("accepts valid metadata with null key", () => {
		const metadata = {
			key: null,
			fiberNode: null,
			mounted: false,
			needsLayout: false,
			needsRender: false,
		};
		expect(() => decodeNodeMetadata(metadata)).not.toThrow();
	});

	test("accepts string key", () => {
		const metadata = {
			key: "my-key",
			fiberNode: null,
			mounted: true,
			needsLayout: true,
			needsRender: true,
		};
		expect(() => decodeNodeMetadata(metadata)).not.toThrow();
	});

	test("accepts number key", () => {
		const metadata = {
			key: 123,
			fiberNode: null,
			mounted: false,
			needsLayout: false,
			needsRender: false,
		};
		expect(() => decodeNodeMetadata(metadata)).not.toThrow();
	});

	test("accepts opaque fiberNode", () => {
		const metadata = {
			key: null,
			fiberNode: { some: "data" },
			mounted: false,
			needsLayout: false,
			needsRender: false,
		};
		expect(() => decodeNodeMetadata(metadata)).not.toThrow();
	});

	test("rejects non-boolean mounted", () => {
		const metadata = {
			key: null,
			fiberNode: null,
			mounted: "yes",
			needsLayout: false,
			needsRender: false,
		};
		expect(() => decodeNodeMetadata(metadata)).toThrow();
	});

	test("rejects missing fields", () => {
		const metadata = {
			key: null,
			fiberNode: null,
			// Missing mounted, needsLayout, needsRender
		};
		expect(() => decodeNodeMetadata(metadata)).toThrow();
	});
});
