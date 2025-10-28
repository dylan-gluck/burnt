/**
 * Component Props Schemas for Ink Port
 *
 * This module defines Effect Schema validators for component props including TextProps and BoxProps.
 * Schemas provide runtime validation with clear error messages for invalid inputs.
 *
 * All schemas follow the DATA_MODEL.md specification (Section 9.1: Component Prop Schemas)
 */

import { Schema } from "@effect/schema";

// ============================================================================
// Color Schemas
// ============================================================================

/**
 * Schema for RGB color validation
 *
 * - r, g, b must be integers between 0-255
 */
export const RGBColorSchema = Schema.Struct({
	r: Schema.Number.pipe(Schema.int(), Schema.between(0, 255)),
	g: Schema.Number.pipe(Schema.int(), Schema.between(0, 255)),
	b: Schema.Number.pipe(Schema.int(), Schema.between(0, 255)),
});

/**
 * Decode RGBColor from unknown input
 *
 * @throws ParseError if validation fails
 */
export const decodeRGBColor = Schema.decodeUnknownSync(RGBColorSchema);

/**
 * Schema for HSL color validation
 *
 * - h must be between 0-360 (degrees)
 * - s must be between 0-100 (percentage)
 * - l must be between 0-100 (percentage)
 */
export const HSLColorSchema = Schema.Struct({
	h: Schema.Number.pipe(Schema.between(0, 360)),
	s: Schema.Number.pipe(Schema.between(0, 100)),
	l: Schema.Number.pipe(Schema.between(0, 100)),
});

/**
 * Decode HSLColor from unknown input
 *
 * @throws ParseError if validation fails
 */
export const decodeHSLColor = Schema.decodeUnknownSync(HSLColorSchema);

/**
 * Schema for Color type
 *
 * Color can be:
 * - A named color string (e.g., "red", "blue", "#FF0000")
 * - An RGB object
 * - An HSL object
 */
export const ColorSchema = Schema.Union(
	Schema.String,
	RGBColorSchema,
	HSLColorSchema
);

export type Color = Schema.Schema.Type<typeof ColorSchema>;

/**
 * Decode Color from unknown input
 *
 * @throws ParseError if validation fails
 */
export const decodeColor = Schema.decodeUnknownSync(ColorSchema);

// ============================================================================
// Text Props Schema
// ============================================================================

/**
 * Schema for text wrapping modes
 */
export const WrapModeSchema = Schema.Literal(
	"wrap",
	"truncate",
	"truncate-start",
	"truncate-middle",
	"truncate-end"
);

export type WrapMode = Schema.Schema.Type<typeof WrapModeSchema>;

/**
 * Decode WrapMode from unknown input
 *
 * @throws ParseError if validation fails
 */
export const decodeWrapMode = Schema.decodeUnknownSync(WrapModeSchema);

/**
 * Schema for TextProps validation
 *
 * Validates props for Text components with optional styling properties.
 *
 * Validation rules:
 * - color and backgroundColor must be valid Color values
 * - wrap must be one of the defined WrapMode literals
 * - All other props are optional booleans
 */
export const TextPropsSchema = Schema.Struct({
	color: Schema.optional(ColorSchema),
	backgroundColor: Schema.optional(ColorSchema),
	dimColor: Schema.optional(Schema.Boolean),
	bold: Schema.optional(Schema.Boolean),
	italic: Schema.optional(Schema.Boolean),
	underline: Schema.optional(Schema.Boolean),
	strikethrough: Schema.optional(Schema.Boolean),
	inverse: Schema.optional(Schema.Boolean),
	wrap: Schema.optional(WrapModeSchema),
});

export type TextProps = Schema.Schema.Type<typeof TextPropsSchema>;

/**
 * Decode TextProps from unknown input
 *
 * @throws ParseError if validation fails
 */
export const decodeTextProps = Schema.decodeUnknownSync(TextPropsSchema);

// ============================================================================
// Box Props Schema
// ============================================================================

/**
 * Schema for flexbox direction
 */
export const FlexDirectionSchema = Schema.Literal(
	"row",
	"column",
	"row-reverse",
	"column-reverse"
);

export type FlexDirection = Schema.Schema.Type<typeof FlexDirectionSchema>;

/**
 * Decode FlexDirection from unknown input
 *
 * @throws ParseError if validation fails
 */
export const decodeFlexDirection =
	Schema.decodeUnknownSync(FlexDirectionSchema);

/**
 * Schema for justify-content alignment
 */
export const JustifyContentSchema = Schema.Literal(
	"flex-start",
	"flex-end",
	"center",
	"space-between",
	"space-around"
);

export type JustifyContent = Schema.Schema.Type<typeof JustifyContentSchema>;

/**
 * Decode JustifyContent from unknown input
 *
 * @throws ParseError if validation fails
 */
export const decodeJustifyContent =
	Schema.decodeUnknownSync(JustifyContentSchema);

/**
 * Schema for align-items alignment
 */
export const AlignItemsSchema = Schema.Literal(
	"flex-start",
	"flex-end",
	"center",
	"stretch"
);

export type AlignItems = Schema.Schema.Type<typeof AlignItemsSchema>;

/**
 * Decode AlignItems from unknown input
 *
 * @throws ParseError if validation fails
 */
export const decodeAlignItems = Schema.decodeUnknownSync(AlignItemsSchema);

/**
 * Schema for align-self alignment
 */
export const AlignSelfSchema = Schema.Literal(
	"auto",
	"flex-start",
	"flex-end",
	"center",
	"stretch"
);

export type AlignSelf = Schema.Schema.Type<typeof AlignSelfSchema>;

/**
 * Decode AlignSelf from unknown input
 *
 * @throws ParseError if validation fails
 */
export const decodeAlignSelf = Schema.decodeUnknownSync(AlignSelfSchema);

/**
 * Schema for position mode
 */
export const PositionSchema = Schema.Literal("relative", "absolute");

export type Position = Schema.Schema.Type<typeof PositionSchema>;

/**
 * Decode Position from unknown input
 *
 * @throws ParseError if validation fails
 */
export const decodePosition = Schema.decodeUnknownSync(PositionSchema);

/**
 * Schema for border styles
 */
export const BorderStyleSchema = Schema.Literal(
	"single",
	"double",
	"round",
	"bold",
	"singleDouble",
	"doubleSingle",
	"classic"
);

export type BorderStyle = Schema.Schema.Type<typeof BorderStyleSchema>;

/**
 * Decode BorderStyle from unknown input
 *
 * @throws ParseError if validation fails
 */
export const decodeBorderStyle = Schema.decodeUnknownSync(BorderStyleSchema);

/**
 * Schema for dimension values (number or percentage string)
 */
export const DimensionSchema = Schema.Union(Schema.Number, Schema.String);

/**
 * Schema for non-negative numbers (used for spacing)
 */
export const NonNegativeNumberSchema = Schema.Number.pipe(
	Schema.greaterThanOrEqualTo(0)
);

/**
 * Schema for BoxProps validation
 *
 * Validates props for Box components with flexbox layout properties.
 *
 * Validation rules:
 * - width/height can be number or string (for percentages)
 * - min/max dimensions must be non-negative numbers
 * - margin/padding values must be non-negative numbers
 * - flexGrow/flexShrink must be non-negative numbers
 * - flexDirection, justifyContent, alignItems must be valid literals
 * - borderStyle must be valid literal
 * - All props are optional
 */
export const BoxPropsSchema = Schema.Struct({
	// Dimensions
	width: Schema.optional(DimensionSchema),
	height: Schema.optional(DimensionSchema),
	minWidth: Schema.optional(NonNegativeNumberSchema),
	minHeight: Schema.optional(NonNegativeNumberSchema),
	maxWidth: Schema.optional(NonNegativeNumberSchema),
	maxHeight: Schema.optional(NonNegativeNumberSchema),

	// Spacing - margins
	margin: Schema.optional(NonNegativeNumberSchema),
	marginLeft: Schema.optional(NonNegativeNumberSchema),
	marginRight: Schema.optional(NonNegativeNumberSchema),
	marginTop: Schema.optional(NonNegativeNumberSchema),
	marginBottom: Schema.optional(NonNegativeNumberSchema),

	// Spacing - padding
	padding: Schema.optional(NonNegativeNumberSchema),
	paddingLeft: Schema.optional(NonNegativeNumberSchema),
	paddingRight: Schema.optional(NonNegativeNumberSchema),
	paddingTop: Schema.optional(NonNegativeNumberSchema),
	paddingBottom: Schema.optional(NonNegativeNumberSchema),

	// Flexbox layout
	flexDirection: Schema.optional(FlexDirectionSchema),
	justifyContent: Schema.optional(JustifyContentSchema),
	alignItems: Schema.optional(AlignItemsSchema),
	alignSelf: Schema.optional(AlignSelfSchema),
	flexGrow: Schema.optional(NonNegativeNumberSchema),
	flexShrink: Schema.optional(NonNegativeNumberSchema),
	flexBasis: Schema.optional(DimensionSchema),

	// Positioning
	position: Schema.optional(PositionSchema),
	top: Schema.optional(Schema.Number),
	right: Schema.optional(Schema.Number),
	bottom: Schema.optional(Schema.Number),
	left: Schema.optional(Schema.Number),

	// Border
	borderStyle: Schema.optional(BorderStyleSchema),
	borderColor: Schema.optional(ColorSchema),
	borderDimColor: Schema.optional(Schema.Boolean),
	borderTop: Schema.optional(Schema.Boolean),
	borderRight: Schema.optional(Schema.Boolean),
	borderBottom: Schema.optional(Schema.Boolean),
	borderLeft: Schema.optional(Schema.Boolean),
});

export type BoxProps = Schema.Schema.Type<typeof BoxPropsSchema>;

/**
 * Decode BoxProps from unknown input
 *
 * @throws ParseError if validation fails
 */
export const decodeBoxProps = Schema.decodeUnknownSync(BoxPropsSchema);

// ============================================================================
// Static Props Schema
// ============================================================================

/**
 * Schema for StaticProps validation
 *
 * Static components render content once and freeze it.
 *
 * Note: Both fields are required (not optional).
 */
export const StaticPropsSchema = Schema.Struct({
	items: Schema.Array(Schema.Unknown),
	children: Schema.Unknown, // Function type (item, index) => ReactElement
});

export type StaticProps = Schema.Schema.Type<typeof StaticPropsSchema>;

/**
 * Decode StaticProps from unknown input
 *
 * @throws ParseError if validation fails
 */
export const decodeStaticProps = Schema.decodeUnknownSync(StaticPropsSchema);

// ============================================================================
// Transform Props Schema
// ============================================================================

/**
 * Schema for TransformProps validation
 *
 * Transform components apply a transformation function to their children's output.
 *
 * Note: Both fields are required (not optional).
 */
export const TransformPropsSchema = Schema.Struct({
	transform: Schema.Unknown, // Function type (text: string) => string
	children: Schema.Unknown, // ReactNode
});

export type TransformProps = Schema.Schema.Type<typeof TransformPropsSchema>;

/**
 * Decode TransformProps from unknown input
 *
 * @throws ParseError if validation fails
 */
export const decodeTransformProps =
	Schema.decodeUnknownSync(TransformPropsSchema);
