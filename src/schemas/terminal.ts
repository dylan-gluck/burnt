/**
 * Terminal Output Schemas for Ink Port
 *
 * This module defines Effect Schema validators for terminal output types including
 * RGB colors, terminal styles, output segments, output buffers, ANTML output, and output diffs.
 *
 * All schemas follow the DATA_MODEL.md specification (Section 3: Terminal Output Data Structures)
 */

import { Schema } from "@effect/schema";

// ============================================================================
// RGB Color Schema
// ============================================================================

/**
 * Schema for RGBColor validation
 *
 * Validates RGB color values with each channel between 0-255.
 *
 * Validation rules:
 * - r, g, b must be integers
 * - All values must be between 0-255 (inclusive)
 */
export const RGBColorSchema = Schema.Struct({
	r: Schema.Number.pipe(Schema.int(), Schema.between(0, 255)),
	g: Schema.Number.pipe(Schema.int(), Schema.between(0, 255)),
	b: Schema.Number.pipe(Schema.int(), Schema.between(0, 255)),
});

export type RGBColor = Schema.Schema.Type<typeof RGBColorSchema>;

/**
 * Decode RGBColor from unknown input
 *
 * @throws ParseError if validation fails
 */
export const decodeRGBColor = Schema.decodeUnknownSync(RGBColorSchema);

// ============================================================================
// Terminal Style Schema
// ============================================================================

/**
 * Schema for TerminalStyle validation
 *
 * Validates ANSI terminal styling including colors and text decorations.
 *
 * Validation rules:
 * - foreground and background are optional RGB colors
 * - All style flags (bold, italic, etc.) are optional booleans
 */
export const TerminalStyleSchema = Schema.Struct({
	foreground: Schema.optional(RGBColorSchema),
	background: Schema.optional(RGBColorSchema),
	bold: Schema.optional(Schema.Boolean),
	italic: Schema.optional(Schema.Boolean),
	underline: Schema.optional(Schema.Boolean),
	strikethrough: Schema.optional(Schema.Boolean),
	dim: Schema.optional(Schema.Boolean),
	inverse: Schema.optional(Schema.Boolean),
});

export type TerminalStyle = Schema.Schema.Type<typeof TerminalStyleSchema>;

/**
 * Decode TerminalStyle from unknown input
 *
 * @throws ParseError if validation fails
 */
export const decodeTerminalStyle =
	Schema.decodeUnknownSync(TerminalStyleSchema);

// ============================================================================
// Output Segment Schema
// ============================================================================

/**
 * Schema for OutputSegment validation
 *
 * Validates text segments with associated terminal styling.
 *
 * Validation rules:
 * - text must be a string (can be empty)
 * - style must be a valid TerminalStyle
 */
export const OutputSegmentSchema = Schema.Struct({
	text: Schema.String,
	style: TerminalStyleSchema,
});

export type OutputSegment = Schema.Schema.Type<typeof OutputSegmentSchema>;

/**
 * Decode OutputSegment from unknown input
 *
 * @throws ParseError if validation fails
 */
export const decodeOutputSegment =
	Schema.decodeUnknownSync(OutputSegmentSchema);

// ============================================================================
// Output Line Schema
// ============================================================================

/**
 * Schema for OutputLine validation
 *
 * Validates a single line of terminal output composed of styled segments.
 *
 * Validation rules:
 * - segments must be an array of valid OutputSegments
 */
export const OutputLineSchema = Schema.Struct({
	segments: Schema.Array(OutputSegmentSchema),
});

export type OutputLine = Schema.Schema.Type<typeof OutputLineSchema>;

/**
 * Decode OutputLine from unknown input
 *
 * @throws ParseError if validation fails
 */
export const decodeOutputLine = Schema.decodeUnknownSync(OutputLineSchema);

// ============================================================================
// Output Buffer Schema
// ============================================================================

/**
 * Schema for OutputBuffer validation
 *
 * Validates the complete terminal output buffer.
 *
 * Validation rules:
 * - lines must be an array of valid OutputLines
 */
export const OutputBufferSchema = Schema.Struct({
	lines: Schema.Array(OutputLineSchema),
});

export type OutputBuffer = Schema.Schema.Type<typeof OutputBufferSchema>;

/**
 * Decode OutputBuffer from unknown input
 *
 * @throws ParseError if validation fails
 */
export const decodeOutputBuffer = Schema.decodeUnknownSync(OutputBufferSchema);

// ============================================================================
// ANTML Output Schema
// ============================================================================

/**
 * Schema for ANTMLOutput validation
 *
 * Validates ANTML (ANSI Terminal Markup Language) output with escape sequences.
 *
 * Validation rules:
 * - type must be the literal "antml"
 * - content must be a string (ANSI escape sequences + text)
 */
export const ANTMLOutputSchema = Schema.Struct({
	type: Schema.Literal("antml"),
	content: Schema.String,
});

export type ANTMLOutput = Schema.Schema.Type<typeof ANTMLOutputSchema>;

/**
 * Decode ANTMLOutput from unknown input
 *
 * @throws ParseError if validation fails
 */
export const decodeANTMLOutput = Schema.decodeUnknownSync(ANTMLOutputSchema);

// ============================================================================
// ANTML Command Schema
// ============================================================================

/**
 * Schema for ANTMLCommand validation
 *
 * Validates terminal control commands (clear, flush, exit).
 *
 * Validation rules:
 * - type must be one of the defined command literals
 * - payload is optional and can be any type
 */
export const ANTMLCommandSchema = Schema.Struct({
	type: Schema.Literal("clear", "flush", "exit"),
	payload: Schema.optional(Schema.Unknown),
});

export type ANTMLCommand = Schema.Schema.Type<typeof ANTMLCommandSchema>;

/**
 * Decode ANTMLCommand from unknown input
 *
 * @throws ParseError if validation fails
 */
export const decodeANTMLCommand = Schema.decodeUnknownSync(ANTMLCommandSchema);

// ============================================================================
// Output Operation Schema
// ============================================================================

/**
 * Schema for OutputOperation validation
 *
 * Validates a single diff operation for incremental rendering.
 *
 * Validation rules:
 * - type must be one of "insert", "delete", "update"
 * - lineIndex must be a non-negative integer
 * - oldLine is optional OutputLine (for delete/update)
 * - newLine is optional OutputLine (for insert/update)
 */
export const OutputOperationSchema = Schema.Struct({
	type: Schema.Literal("insert", "delete", "update"),
	lineIndex: Schema.Number.pipe(Schema.int(), Schema.greaterThanOrEqualTo(0)),
	oldLine: Schema.optional(OutputLineSchema),
	newLine: Schema.optional(OutputLineSchema),
});

export type OutputOperation = Schema.Schema.Type<typeof OutputOperationSchema>;

/**
 * Decode OutputOperation from unknown input
 *
 * @throws ParseError if validation fails
 */
export const decodeOutputOperation = Schema.decodeUnknownSync(
	OutputOperationSchema
);

// ============================================================================
// Output Diff Schema
// ============================================================================

/**
 * Schema for OutputDiff validation
 *
 * Validates the diff between two output buffers for efficient rendering.
 *
 * Validation rules:
 * - operations must be an array of valid OutputOperations
 */
export const OutputDiffSchema = Schema.Struct({
	operations: Schema.Array(OutputOperationSchema),
});

export type OutputDiff = Schema.Schema.Type<typeof OutputDiffSchema>;

/**
 * Decode OutputDiff from unknown input
 *
 * @throws ParseError if validation fails
 */
export const decodeOutputDiff = Schema.decodeUnknownSync(OutputDiffSchema);
