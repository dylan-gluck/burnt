/**
 * Input Event Schemas for Ink Port
 *
 * This module defines Effect Schema validators for input handling types including
 * keyboard events, mouse events, terminal resize events, and focus management.
 *
 * All schemas follow the DATA_MODEL.md specification (Section 4: Input Data Structures)
 */

import { Schema } from "@effect/schema";

// ============================================================================
// Key Schema
// ============================================================================

/**
 * Schema for Key validation
 *
 * Validates parsed keyboard key information.
 *
 * Validation rules:
 * - name must be a non-empty string
 * - sequence must be a string (the raw escape sequence)
 * - ctrl, meta, shift must be booleans
 */
export const KeySchema = Schema.Struct({
	name: Schema.String.pipe(Schema.minLength(1)),
	sequence: Schema.String,
	ctrl: Schema.Boolean,
	meta: Schema.Boolean,
	shift: Schema.Boolean,
});

export type Key = Schema.Schema.Type<typeof KeySchema>;

/**
 * Decode Key from unknown input
 *
 * @throws ParseError if validation fails
 */
export const decodeKey = Schema.decodeUnknownSync(KeySchema);

// ============================================================================
// Key Modifiers Schema
// ============================================================================

/**
 * Schema for KeyModifiers validation
 *
 * Validates keyboard modifier key state.
 *
 * Validation rules:
 * - All modifier flags must be booleans
 */
export const KeyModifiersSchema = Schema.Struct({
	ctrl: Schema.Boolean,
	alt: Schema.Boolean,
	shift: Schema.Boolean,
	meta: Schema.Boolean,
});

export type KeyModifiers = Schema.Schema.Type<typeof KeyModifiersSchema>;

/**
 * Decode KeyModifiers from unknown input
 *
 * @throws ParseError if validation fails
 */
export const decodeKeyModifiers = Schema.decodeUnknownSync(KeyModifiersSchema);

// ============================================================================
// KeyPress Event Schema
// ============================================================================

/**
 * Schema for KeyPress event validation
 *
 * Validates keyboard input events.
 *
 * Validation rules:
 * - type must be the literal "keypress"
 * - key must be a valid Key
 * - modifiers must be valid KeyModifiers
 */
export const KeyPressSchema = Schema.Struct({
	type: Schema.Literal("keypress"),
	key: KeySchema,
	modifiers: KeyModifiersSchema,
});

export type KeyPress = Schema.Schema.Type<typeof KeyPressSchema>;

/**
 * Decode KeyPress from unknown input
 *
 * @throws ParseError if validation fails
 */
export const decodeKeyPress = Schema.decodeUnknownSync(KeyPressSchema);

// ============================================================================
// Mouse Event Schema
// ============================================================================

/**
 * Schema for MouseEvent validation
 *
 * Validates mouse input events in the terminal.
 *
 * Validation rules:
 * - type must be the literal "mouse"
 * - x and y must be non-negative integers (terminal coordinates)
 * - button must be one of the defined button types
 * - action must be one of the defined action types
 */
export const MouseEventSchema = Schema.Struct({
	type: Schema.Literal("mouse"),
	x: Schema.Number.pipe(Schema.int(), Schema.greaterThanOrEqualTo(0)),
	y: Schema.Number.pipe(Schema.int(), Schema.greaterThanOrEqualTo(0)),
	button: Schema.Literal("left", "right", "middle", "wheelUp", "wheelDown"),
	action: Schema.Literal("press", "release", "move"),
});

export type MouseEvent = Schema.Schema.Type<typeof MouseEventSchema>;

/**
 * Decode MouseEvent from unknown input
 *
 * @throws ParseError if validation fails
 */
export const decodeMouseEvent = Schema.decodeUnknownSync(MouseEventSchema);

// ============================================================================
// Resize Event Schema
// ============================================================================

/**
 * Schema for ResizeEvent validation
 *
 * Validates terminal resize events.
 *
 * Validation rules:
 * - type must be the literal "resize"
 * - width and height must be positive integers
 */
export const ResizeEventSchema = Schema.Struct({
	type: Schema.Literal("resize"),
	width: Schema.Number.pipe(Schema.int(), Schema.greaterThan(0)),
	height: Schema.Number.pipe(Schema.int(), Schema.greaterThan(0)),
});

export type ResizeEvent = Schema.Schema.Type<typeof ResizeEventSchema>;

/**
 * Decode ResizeEvent from unknown input
 *
 * @throws ParseError if validation fails
 */
export const decodeResizeEvent = Schema.decodeUnknownSync(ResizeEventSchema);

// ============================================================================
// Input Event Union Schema
// ============================================================================

/**
 * Schema for InputEvent discriminated union
 *
 * Validates any input event type using type discrimination on the `type` field.
 *
 * This schema uses Schema.Union to create a discriminated union that validates
 * the correct event structure based on the `type` field.
 */
export const InputEventSchema = Schema.Union(
	KeyPressSchema,
	MouseEventSchema,
	ResizeEventSchema
);

export type InputEvent = Schema.Schema.Type<typeof InputEventSchema>;

/**
 * Decode InputEvent from unknown input
 *
 * @throws ParseError if validation fails
 */
export const decodeInputEvent = Schema.decodeUnknownSync(InputEventSchema);

// ============================================================================
// Focus State Schema
// ============================================================================

/**
 * Schema for FocusState validation
 *
 * Validates focus state for interactive components.
 *
 * Validation rules:
 * - focusedNodeId can be a string or null
 * - focusHistory must be an array of strings (node IDs)
 */
export const FocusStateSchema = Schema.Struct({
	focusedNodeId: Schema.NullOr(Schema.String),
	focusHistory: Schema.Array(Schema.String),
});

export type FocusState = Schema.Schema.Type<typeof FocusStateSchema>;

/**
 * Decode FocusState from unknown input
 *
 * @throws ParseError if validation fails
 */
export const decodeFocusState = Schema.decodeUnknownSync(FocusStateSchema);
