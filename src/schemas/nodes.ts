/**
 * Render Node Schemas for Ink Port
 *
 * This module defines Effect Schema validators for render tree nodes including
 * node types, metadata, layout info, and the discriminated union of all node types.
 *
 * All schemas follow the DATA_MODEL.md specification (Section 9: Schema Definitions)
 */

import { Schema } from "@effect/schema";
import {
	BoxPropsSchema,
	StaticPropsSchema,
	TextPropsSchema,
	TransformPropsSchema,
} from "./props.js";

// ============================================================================
// Node Type Schema
// ============================================================================

/**
 * Schema for NodeType enum
 *
 * Validates the node type discriminator for the render node union.
 */
export const NodeTypeSchema = Schema.Literal(
	"root",
	"text",
	"box",
	"newline",
	"spacer",
	"static",
	"transform"
);

/**
 * Decode NodeType from unknown input
 *
 * @throws ParseError if validation fails
 */
export const decodeNodeType = Schema.decodeUnknownSync(NodeTypeSchema);

// ============================================================================
// Layout Info Schema
// ============================================================================

/**
 * Schema for LayoutInfo validation
 *
 * Validates computed layout information from Yoga layout engine.
 *
 * Validation rules:
 * - All values must be numbers
 * - x, y represent absolute positioning
 * - width, height must be non-negative
 * - left, top represent relative offsets
 */
export const LayoutInfoSchema = Schema.Struct({
	x: Schema.Number,
	y: Schema.Number,
	width: Schema.Number.pipe(Schema.greaterThanOrEqualTo(0)),
	height: Schema.Number.pipe(Schema.greaterThanOrEqualTo(0)),
	left: Schema.Number,
	top: Schema.Number,
});

/**
 * Decode LayoutInfo from unknown input
 *
 * @throws ParseError if validation fails
 */
export const decodeLayoutInfo = Schema.decodeUnknownSync(LayoutInfoSchema);

// ============================================================================
// Node Metadata Schema
// ============================================================================

/**
 * Schema for NodeMetadata validation
 *
 * Validates reconciliation and lifecycle tracking metadata for render nodes.
 *
 * Validation rules:
 * - key can be string, number, or null
 * - fiberNode is opaque (unknown) or null
 * - Boolean flags for mount and dirty state
 */
export const NodeMetadataSchema = Schema.Struct({
	key: Schema.NullOr(Schema.Union(Schema.String, Schema.Number)),
	fiberNode: Schema.NullOr(Schema.Unknown),
	mounted: Schema.Boolean,
	needsLayout: Schema.Boolean,
	needsRender: Schema.Boolean,
});

/**
 * Decode NodeMetadata from unknown input
 *
 * @throws ParseError if validation fails
 */
export const decodeNodeMetadata = Schema.decodeUnknownSync(NodeMetadataSchema);

// ============================================================================
// Yoga Node Schema
// ============================================================================

/**
 * Schema for YogaNode validation
 *
 * Validates Yoga layout engine node wrapper.
 *
 * Note: This is a simplified schema since YogaNode contains methods.
 * For full validation, use the YogaNode interface from types/layout.ts.
 */
export const YogaNodeSchema = Schema.Struct({
	nativeNode: Schema.Unknown,
	id: Schema.String,
	children: Schema.Array(Schema.Unknown), // Recursive, using Unknown to avoid circular reference
	computed: Schema.Boolean,
});

/**
 * Decode YogaNode from unknown input
 *
 * @throws ParseError if validation fails
 */
export const decodeYogaNode = Schema.decodeUnknownSync(YogaNodeSchema);

// ============================================================================
// Styled Text Schema
// ============================================================================

/**
 * Schema for TextStyle validation
 *
 * Validates computed text styling (after color parsing).
 */
export const TextStyleSchema = Schema.Struct({
	foreground: Schema.optional(
		Schema.Struct({
			r: Schema.Number.pipe(Schema.int(), Schema.between(0, 255)),
			g: Schema.Number.pipe(Schema.int(), Schema.between(0, 255)),
			b: Schema.Number.pipe(Schema.int(), Schema.between(0, 255)),
		})
	),
	background: Schema.optional(
		Schema.Struct({
			r: Schema.Number.pipe(Schema.int(), Schema.between(0, 255)),
			g: Schema.Number.pipe(Schema.int(), Schema.between(0, 255)),
			b: Schema.Number.pipe(Schema.int(), Schema.between(0, 255)),
		})
	),
	bold: Schema.Boolean,
	italic: Schema.Boolean,
	underline: Schema.Boolean,
	strikethrough: Schema.Boolean,
	inverse: Schema.Boolean,
	dim: Schema.Boolean,
});

/**
 * Decode TextStyle from unknown input
 *
 * @throws ParseError if validation fails
 */
export const decodeTextStyle = Schema.decodeUnknownSync(TextStyleSchema);

/**
 * Schema for StyledText validation
 *
 * Validates text segments with associated styling.
 */
export const StyledTextSchema = Schema.Struct({
	text: Schema.String,
	styles: TextStyleSchema,
});

/**
 * Decode StyledText from unknown input
 *
 * @throws ParseError if validation fails
 */
export const decodeStyledText = Schema.decodeUnknownSync(StyledTextSchema);

// ============================================================================
// Render Node Schemas (Forward Declaration for Recursion)
// ============================================================================

// We use Schema.suspend to handle the recursive children reference
// Each node schema is defined separately to avoid issues with Schema.extend

/**
 * Schema for RootNode validation
 *
 * Note: Type is inferred from schema structure for full type safety without using `any`.
 * The inferred type includes proper validation of all fields including recursive children.
 */
export const RootNodeSchema: Schema.Schema.Any = Schema.Struct({
	id: Schema.String,
	type: Schema.Literal("root"),
	props: Schema.Record({ key: Schema.String, value: Schema.Unknown }),
	children: Schema.suspend(() => Schema.Array(RenderNodeSchema)),
	parent: Schema.NullOr(Schema.suspend(() => RenderNodeSchema)),
	layoutInfo: Schema.NullOr(LayoutInfoSchema),
	yogaNode: Schema.NullOr(YogaNodeSchema),
	metadata: NodeMetadataSchema,
});

/**
 * Schema for TextNode validation
 *
 * Note: Type is inferred from schema structure for full type safety without using `any`.
 * The inferred type includes proper validation of all fields including recursive children.
 */
export const TextNodeSchema: Schema.Schema.Any = Schema.Struct({
	id: Schema.String,
	type: Schema.Literal("text"),
	props: TextPropsSchema,
	textContent: Schema.String,
	styledContent: Schema.Array(StyledTextSchema),
	children: Schema.suspend(() => Schema.Array(RenderNodeSchema)),
	parent: Schema.NullOr(Schema.suspend(() => RenderNodeSchema)),
	layoutInfo: Schema.NullOr(LayoutInfoSchema),
	yogaNode: Schema.NullOr(YogaNodeSchema),
	metadata: NodeMetadataSchema,
});

/**
 * Schema for BoxNode validation
 *
 * Note: Type is inferred from schema structure for full type safety without using `any`.
 * The inferred type includes proper validation of all fields including recursive children.
 */
export const BoxNodeSchema: Schema.Schema.Any = Schema.Struct({
	id: Schema.String,
	type: Schema.Literal("box"),
	props: BoxPropsSchema,
	children: Schema.suspend(() => Schema.Array(RenderNodeSchema)),
	parent: Schema.NullOr(Schema.suspend(() => RenderNodeSchema)),
	layoutInfo: Schema.NullOr(LayoutInfoSchema),
	yogaNode: Schema.NullOr(YogaNodeSchema),
	metadata: NodeMetadataSchema,
});

/**
 * Schema for NewlineNode validation
 *
 * Note: Type is inferred from schema structure for full type safety without using `any`.
 * The inferred type includes proper validation of all fields including recursive children.
 */
export const NewlineNodeSchema: Schema.Schema.Any = Schema.Struct({
	id: Schema.String,
	type: Schema.Literal("newline"),
	props: Schema.Record({ key: Schema.String, value: Schema.Unknown }),
	count: Schema.Number.pipe(Schema.int(), Schema.greaterThan(0)),
	children: Schema.suspend(() => Schema.Array(RenderNodeSchema)),
	parent: Schema.NullOr(Schema.suspend(() => RenderNodeSchema)),
	layoutInfo: Schema.NullOr(LayoutInfoSchema),
	yogaNode: Schema.NullOr(YogaNodeSchema),
	metadata: NodeMetadataSchema,
});

/**
 * Schema for SpacerNode validation
 *
 * Note: Type is inferred from schema structure for full type safety without using `any`.
 * The inferred type includes proper validation of all fields including recursive children.
 */
export const SpacerNodeSchema: Schema.Schema.Any = Schema.Struct({
	id: Schema.String,
	type: Schema.Literal("spacer"),
	props: Schema.Record({ key: Schema.String, value: Schema.Unknown }),
	children: Schema.suspend(() => Schema.Array(RenderNodeSchema)),
	parent: Schema.NullOr(Schema.suspend(() => RenderNodeSchema)),
	layoutInfo: Schema.NullOr(LayoutInfoSchema),
	yogaNode: Schema.NullOr(YogaNodeSchema),
	metadata: NodeMetadataSchema,
});

/**
 * Schema for StaticNode validation
 *
 * Note: Type is inferred from schema structure for full type safety without using `any`.
 * The inferred type includes proper validation of all fields including recursive children.
 */
export const StaticNodeSchema: Schema.Schema.Any = Schema.Struct({
	id: Schema.String,
	type: Schema.Literal("static"),
	props: StaticPropsSchema,
	frozenContent: Schema.String,
	children: Schema.suspend(() => Schema.Array(RenderNodeSchema)),
	parent: Schema.NullOr(Schema.suspend(() => RenderNodeSchema)),
	layoutInfo: Schema.NullOr(LayoutInfoSchema),
	yogaNode: Schema.NullOr(YogaNodeSchema),
	metadata: NodeMetadataSchema,
});

/**
 * Schema for TransformNode validation
 *
 * Note: Type is inferred from schema structure for full type safety without using `any`.
 * The inferred type includes proper validation of all fields including recursive children.
 */
export const TransformNodeSchema: Schema.Schema.Any = Schema.Struct({
	id: Schema.String,
	type: Schema.Literal("transform"),
	props: TransformPropsSchema,
	transformedContent: Schema.String,
	children: Schema.suspend(() => Schema.Array(RenderNodeSchema)),
	parent: Schema.NullOr(Schema.suspend(() => RenderNodeSchema)),
	layoutInfo: Schema.NullOr(LayoutInfoSchema),
	yogaNode: Schema.NullOr(YogaNodeSchema),
	metadata: NodeMetadataSchema,
});

// ============================================================================
// Render Node Union Schema
// ============================================================================

/**
 * Schema for RenderNode discriminated union
 *
 * Validates any render node type using type discrimination on the `type` field.
 *
 * This schema uses Schema.Union to create a discriminated union that validates
 * the correct node structure based on the `type` field.
 *
 * Note: Type is inferred from schema structure for full type safety without using `any`.
 * The inferred type is a discriminated union of all node types.
 */
export const RenderNodeSchema: Schema.Schema.Any = Schema.Union(
	RootNodeSchema,
	TextNodeSchema,
	BoxNodeSchema,
	NewlineNodeSchema,
	SpacerNodeSchema,
	StaticNodeSchema,
	TransformNodeSchema
);

/**
 * Decode RenderNode from unknown input
 *
 * @throws ParseError if validation fails
 */
export const decodeRenderNode = Schema.decodeUnknownSync(
	// biome-ignore lint/suspicious/noExplicitAny: Type assertion needed for Effect Schema context compatibility
	RenderNodeSchema as Schema.Schema<any, any, never>
);

/**
 * Decode RootNode from unknown input
 *
 * @throws ParseError if validation fails
 */
export const decodeRootNode = Schema.decodeUnknownSync(
	// biome-ignore lint/suspicious/noExplicitAny: Type assertion needed for Effect Schema context compatibility
	RootNodeSchema as Schema.Schema<any, any, never>
);

/**
 * Decode TextNode from unknown input
 *
 * @throws ParseError if validation fails
 */
export const decodeTextNode = Schema.decodeUnknownSync(
	// biome-ignore lint/suspicious/noExplicitAny: Type assertion needed for Effect Schema context compatibility
	TextNodeSchema as Schema.Schema<any, any, never>
);

/**
 * Decode BoxNode from unknown input
 *
 * @throws ParseError if validation fails
 */
export const decodeBoxNode = Schema.decodeUnknownSync(
	// biome-ignore lint/suspicious/noExplicitAny: Type assertion needed for Effect Schema context compatibility
	BoxNodeSchema as Schema.Schema<any, any, never>
);

/**
 * Decode NewlineNode from unknown input
 *
 * @throws ParseError if validation fails
 */
export const decodeNewlineNode = Schema.decodeUnknownSync(
	// biome-ignore lint/suspicious/noExplicitAny: Type assertion needed for Effect Schema context compatibility
	NewlineNodeSchema as Schema.Schema<any, any, never>
);

/**
 * Decode SpacerNode from unknown input
 *
 * @throws ParseError if validation fails
 */
export const decodeSpacerNode = Schema.decodeUnknownSync(
	// biome-ignore lint/suspicious/noExplicitAny: Type assertion needed for Effect Schema context compatibility
	SpacerNodeSchema as Schema.Schema<any, any, never>
);

/**
 * Decode StaticNode from unknown input
 *
 * @throws ParseError if validation fails
 */
export const decodeStaticNode = Schema.decodeUnknownSync(
	// biome-ignore lint/suspicious/noExplicitAny: Type assertion needed for Effect Schema context compatibility
	StaticNodeSchema as Schema.Schema<any, any, never>
);

/**
 * Decode TransformNode from unknown input
 *
 * @throws ParseError if validation fails
 */
export const decodeTransformNode = Schema.decodeUnknownSync(
	// biome-ignore lint/suspicious/noExplicitAny: Type assertion needed for Effect Schema context compatibility
	TransformNodeSchema as Schema.Schema<any, any, never>
);

// ============================================================================
// Render Tree Schema
// ============================================================================

/**
 * Schema for RenderTree validation
 *
 * Validates the entire render tree structure.
 *
 * Note: Map and Set are represented as unknown in the schema for serialization.
 */
export const RenderTreeSchema = Schema.Struct({
	root: RenderNodeSchema,
	nodeMap: Schema.Unknown, // Map<string, RenderNode> - complex to validate
	dirtyNodes: Schema.Unknown, // Set<string> - complex to validate
	version: Schema.Number.pipe(Schema.int(), Schema.greaterThanOrEqualTo(0)),
});

/**
 * Decode RenderTree from unknown input
 *
 * @throws ParseError if validation fails
 */
export const decodeRenderTree = Schema.decodeUnknownSync(
	// biome-ignore lint/suspicious/noExplicitAny: Type assertion needed for Effect Schema context compatibility
	RenderTreeSchema as unknown as Schema.Schema<any, any, never>
);
