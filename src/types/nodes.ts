/**
 * Render Node Types for Ink Port
 *
 * This module defines the core data structures for the render tree, including
 * node types, props, layout information, and helper functions for creating nodes.
 *
 * All types follow the DATA_MODEL.md specification (Section 1: Render Tree Data Structures)
 */

// ============================================================================
// Node Type Enum
// ============================================================================

/**
 * Discriminated union tag for render node types
 */
export enum NodeType {
	ROOT = "root",
	TEXT = "text",
	BOX = "box",
	NEWLINE = "newline",
	SPACER = "spacer",
	STATIC = "static",
	TRANSFORM = "transform",
}

// ============================================================================
// Color Types
// ============================================================================

/**
 * RGB color representation
 */
export interface RGBColor {
	r: number; // 0-255
	g: number; // 0-255
	b: number; // 0-255
}

/**
 * HSL color representation
 */
export interface HSLColor {
	h: number; // 0-360
	s: number; // 0-100
	l: number; // 0-100
}

/**
 * Color can be a named string, RGB object, or HSL object
 */
export type Color = string | RGBColor | HSLColor;

// ============================================================================
// Text Styling Types
// ============================================================================

/**
 * Text wrapping strategies
 */
export type WrapMode =
	| "wrap"
	| "truncate"
	| "truncate-start"
	| "truncate-middle"
	| "truncate-end";

/**
 * Props for Text nodes
 */
export interface TextProps {
	color?: Color;
	backgroundColor?: Color;
	dimColor?: boolean;
	bold?: boolean;
	italic?: boolean;
	underline?: boolean;
	strikethrough?: boolean;
	inverse?: boolean;
	wrap?: WrapMode;
}

/**
 * Computed text style (after color parsing)
 */
export interface TextStyle {
	foreground?: RGBColor;
	background?: RGBColor;
	bold: boolean;
	italic: boolean;
	underline: boolean;
	strikethrough: boolean;
	inverse: boolean;
	dim: boolean;
}

/**
 * Styled text segment (text with associated styles)
 */
export interface StyledText {
	text: string;
	styles: TextStyle;
}

// ============================================================================
// Box Layout Props
// ============================================================================

/**
 * Flexbox direction
 */
export type FlexDirection = "row" | "column" | "row-reverse" | "column-reverse";

/**
 * Flexbox alignment
 */
export type AlignItems = "flex-start" | "flex-end" | "center" | "stretch";
export type AlignSelf =
	| "auto"
	| "flex-start"
	| "flex-end"
	| "center"
	| "stretch";
export type JustifyContent =
	| "flex-start"
	| "flex-end"
	| "center"
	| "space-between"
	| "space-around";

/**
 * Position mode
 */
export type Position = "relative" | "absolute";

/**
 * Border styles
 */
export type BorderStyle =
	| "single"
	| "double"
	| "round"
	| "bold"
	| "singleDouble"
	| "doubleSingle"
	| "classic";

/**
 * Props for Box nodes (Flexbox layout container)
 */
export interface BoxProps {
	// Dimensions
	width?: number | string;
	height?: number | string;
	minWidth?: number;
	minHeight?: number;
	maxWidth?: number;
	maxHeight?: number;

	// Spacing
	margin?: number;
	marginLeft?: number;
	marginRight?: number;
	marginTop?: number;
	marginBottom?: number;
	padding?: number;
	paddingLeft?: number;
	paddingRight?: number;
	paddingTop?: number;
	paddingBottom?: number;

	// Flexbox
	flexDirection?: FlexDirection;
	justifyContent?: JustifyContent;
	alignItems?: AlignItems;
	alignSelf?: AlignSelf;
	flexGrow?: number;
	flexShrink?: number;
	flexBasis?: number | string;

	// Positioning
	position?: Position;
	top?: number;
	right?: number;
	bottom?: number;
	left?: number;

	// Border
	borderStyle?: BorderStyle;
	borderColor?: Color;
	borderDimColor?: boolean;
	borderTop?: boolean;
	borderRight?: boolean;
	borderBottom?: boolean;
	borderLeft?: boolean;
}

// ============================================================================
// Special Node Props
// ============================================================================

/**
 * Props for Static nodes (content that doesn't update)
 */
export interface StaticProps {
	items: unknown[];
	children: (item: unknown, index: number) => unknown; // ReactElement in runtime
}

/**
 * Props for Transform nodes (content transformation)
 */
export interface TransformProps {
	transform: (text: string) => string;
	children: unknown; // ReactNode in runtime
}

// ============================================================================
// Layout Information
// ============================================================================

/**
 * Computed layout information from Yoga
 */
export interface LayoutInfo {
	x: number; // Absolute X position
	y: number; // Absolute Y position
	width: number; // Computed width
	height: number; // Computed height
	left: number; // Left offset
	top: number; // Top offset
}

/**
 * Yoga node wrapper for layout engine integration
 *
 * Note: For full YogaNode interface with methods, see types/layout.ts
 * This is a simplified version used in RenderNode references.
 */
export type YogaNode = unknown;

// ============================================================================
// Node Metadata
// ============================================================================

/**
 * Metadata for render nodes (reconciliation and lifecycle tracking)
 */
export interface NodeMetadata {
	key: string | number | null; // React key
	fiberNode: unknown | null; // React Fiber reference (opaque type)
	mounted: boolean; // Mount status
	needsLayout: boolean; // Layout dirty flag
	needsRender: boolean; // Render dirty flag
}

// ============================================================================
// Base Render Node
// ============================================================================

/**
 * Base interface for all render nodes (without props to avoid type conflicts)
 */
export interface RenderNodeBase {
	id: string; // Unique node identifier
	type: NodeType; // Node type discriminator
	children: RenderNode[]; // Child nodes
	parent: RenderNode | null; // Parent node reference
	layoutInfo: LayoutInfo | null; // Calculated layout (set by Yoga)
	yogaNode: YogaNode | null; // Yoga node reference
	metadata: NodeMetadata; // Reconciliation metadata
}

// ============================================================================
// Typed Node Interfaces (Discriminated Union)
// ============================================================================

/**
 * Root node (container for entire tree)
 */
export interface RootNode extends RenderNodeBase {
	type: NodeType.ROOT;
	props: Record<string, unknown>; // Component props
}

/**
 * Text node (renders styled text)
 */
export interface TextNode extends RenderNodeBase {
	type: NodeType.TEXT;
	props: TextProps;
	textContent: string; // Actual text content
	styledContent: StyledText[]; // Styled text segments
}

/**
 * Box node (flexbox layout container)
 */
export interface BoxNode extends RenderNodeBase {
	type: NodeType.BOX;
	props: BoxProps;
}

/**
 * Newline node (inserts line breaks)
 */
export interface NewlineNode extends RenderNodeBase {
	type: NodeType.NEWLINE;
	props: Record<string, unknown>; // Component props
	count: number; // Number of newlines (default 1)
}

/**
 * Spacer node (flexible spacing element)
 */
export interface SpacerNode extends RenderNodeBase {
	type: NodeType.SPACER;
	props: Record<string, unknown>; // Component props
	// Inherits flexbox behavior from parent
}

/**
 * Static node (content that doesn't update after initial render)
 */
export interface StaticNode extends RenderNodeBase {
	type: NodeType.STATIC;
	props: StaticProps;
	frozenContent: string; // Rendered content that doesn't update
}

/**
 * Transform node (applies transformation function to content)
 */
export interface TransformNode extends RenderNodeBase {
	type: NodeType.TRANSFORM;
	props: TransformProps;
	transformedContent: string; // Result of transformation
}

/**
 * Union type of all render node types (discriminated union)
 */
export type RenderNode =
	| RootNode
	| TextNode
	| BoxNode
	| NewlineNode
	| SpacerNode
	| StaticNode
	| TransformNode;

// ============================================================================
// Render Tree
// ============================================================================

/**
 * Render tree structure (immutable)
 */
export interface RenderTree {
	root: RenderNode; // Root node
	nodeMap: Map<string, RenderNode>; // Fast node lookup by ID
	dirtyNodes: Set<string>; // Nodes needing layout/render
	version: number; // Tree version for change detection
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Generates a unique node ID
 */
let nodeIdCounter = 0;
function generateNodeId(): string {
	return `node-${++nodeIdCounter}`;
}

/**
 * Creates an empty render tree with a root node
 */
export function createRenderTree(): RenderTree {
	const rootNode: RootNode = {
		id: generateNodeId(),
		type: NodeType.ROOT,
		props: {},
		children: [],
		parent: null,
		layoutInfo: null,
		yogaNode: null,
		metadata: {
			key: null,
			fiberNode: null,
			mounted: false,
			needsLayout: false,
			needsRender: false,
		},
	};

	const nodeMap = new Map<string, RenderNode>();
	nodeMap.set(rootNode.id, rootNode);

	return {
		root: rootNode,
		nodeMap,
		dirtyNodes: new Set<string>(),
		version: 0,
	};
}

/**
 * Creates base node properties shared by all node types
 */
function createBaseNode(id: string, type: NodeType): RenderNodeBase {
	return {
		id,
		type,
		children: [],
		parent: null,
		layoutInfo: null,
		yogaNode: null,
		metadata: {
			key: null,
			fiberNode: null,
			mounted: false,
			needsLayout: false,
			needsRender: false,
		},
	};
}

/**
 * Node type-specific property defaults
 */
const nodeDefaults: Record<NodeType, Partial<RenderNode>> = {
	[NodeType.ROOT]: { props: {} },
	[NodeType.TEXT]: { props: {}, textContent: "", styledContent: [] },
	[NodeType.BOX]: { props: {} },
	[NodeType.NEWLINE]: { props: {}, count: 1 },
	[NodeType.SPACER]: { props: {} },
	[NodeType.STATIC]: {
		props: { items: [], children: () => null },
		frozenContent: "",
	},
	[NodeType.TRANSFORM]: {
		props: { transform: (s: string) => s, children: null },
		transformedContent: "",
	},
};

/**
 * Creates a new render node of the specified type
 */
export function createNode(type: NodeType): RenderNode {
	const id = generateNodeId();
	const base = createBaseNode(id, type);
	const defaults = nodeDefaults[type];

	return { ...base, ...defaults } as RenderNode;
}

// ============================================================================
// Type Guards
// ============================================================================

export const isTextNode = (node: RenderNode): node is TextNode =>
	node.type === NodeType.TEXT;
export const isBoxNode = (node: RenderNode): node is BoxNode =>
	node.type === NodeType.BOX;
export const isNewlineNode = (node: RenderNode): node is NewlineNode =>
	node.type === NodeType.NEWLINE;
export const isSpacerNode = (node: RenderNode): node is SpacerNode =>
	node.type === NodeType.SPACER;
export const isStaticNode = (node: RenderNode): node is StaticNode =>
	node.type === NodeType.STATIC;
export const isTransformNode = (node: RenderNode): node is TransformNode =>
	node.type === NodeType.TRANSFORM;
export const isRootNode = (node: RenderNode): node is RootNode =>
	node.type === NodeType.ROOT;
