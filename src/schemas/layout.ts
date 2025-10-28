/**
 * Layout Schemas for Ink Port
 *
 * This module defines Effect Schema validators for layout calculation types including
 * layout requests and layout results.
 *
 * All schemas follow the DATA_MODEL.md specification (Section 2: Layout Data Structures)
 */

import { Schema } from "@effect/schema";
import { LayoutInfoSchema } from "./nodes.js";

// ============================================================================
// Layout Request Schema
// ============================================================================

/**
 * Schema for LayoutRequest validation
 *
 * Validates requests for layout calculation from the LayoutService.
 *
 * Validation rules:
 * - nodeId must be a non-empty string
 * - terminalWidth and terminalHeight must be positive integers
 * - force is a boolean flag to bypass caching
 */
export const LayoutRequestSchema = Schema.Struct({
	nodeId: Schema.String.pipe(Schema.minLength(1)),
	terminalWidth: Schema.Number.pipe(Schema.int(), Schema.greaterThan(0)),
	terminalHeight: Schema.Number.pipe(Schema.int(), Schema.greaterThan(0)),
	force: Schema.Boolean,
});

export type LayoutRequest = Schema.Schema.Type<typeof LayoutRequestSchema>;

/**
 * Decode LayoutRequest from unknown input
 *
 * @throws ParseError if validation fails
 */
export const decodeLayoutRequest =
	Schema.decodeUnknownSync(LayoutRequestSchema);

// ============================================================================
// Layout Result Schema
// ============================================================================

/**
 * Schema for LayoutResult validation
 *
 * Validates the result of layout calculation, including computed layout info
 * for the requested node and all its children.
 *
 * Validation rules:
 * - nodeId must be a non-empty string
 * - layout must be valid LayoutInfo
 * - childLayouts is a map of node IDs to LayoutInfo (represented as Record for schema)
 * - timestamp must be a non-negative number (Unix timestamp in milliseconds)
 */
export const LayoutResultSchema = Schema.Struct({
	nodeId: Schema.String.pipe(Schema.minLength(1)),
	layout: LayoutInfoSchema,
	childLayouts: Schema.Unknown, // Map<string, LayoutInfo> - complex to validate directly
	timestamp: Schema.Number.pipe(Schema.greaterThanOrEqualTo(0)),
});

export type LayoutResult = Schema.Schema.Type<typeof LayoutResultSchema>;

/**
 * Decode LayoutResult from unknown input
 *
 * @throws ParseError if validation fails
 */
export const decodeLayoutResult = Schema.decodeUnknownSync(LayoutResultSchema);

// ============================================================================
// Helper Schemas for Layout Validation
// ============================================================================

/**
 * Schema for validating a Map entry of child layouts
 *
 * This can be used to validate individual entries in the childLayouts map.
 */
export const ChildLayoutEntrySchema = Schema.Struct({
	nodeId: Schema.String.pipe(Schema.minLength(1)),
	layout: LayoutInfoSchema,
});

export type ChildLayoutEntry = Schema.Schema.Type<
	typeof ChildLayoutEntrySchema
>;

/**
 * Decode ChildLayoutEntry from unknown input
 *
 * @throws ParseError if validation fails
 */
export const decodeChildLayoutEntry = Schema.decodeUnknownSync(
	ChildLayoutEntrySchema
);
