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
 * Yoga node wrapper (opaque type for Yoga layout engine integration)
 */
export interface YogaNode {
	nativeNode: unknown; // Native Yoga node (opaque type)
	id: string; // Corresponding render node ID
	children: YogaNode[]; // Child Yoga nodes
	computed: boolean; // Layout computed flag
}

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
 * Creates a new render node of the specified type
 */
export function createNode(type: NodeType): RenderNode {
	const id = generateNodeId();
	const baseMetadata: NodeMetadata = {
		key: null,
		fiberNode: null,
		mounted: false,
		needsLayout: false,
		needsRender: false,
	};

	switch (type) {
		case NodeType.ROOT:
			return {
				id,
				type: NodeType.ROOT,
				props: {},
				children: [],
				parent: null,
				layoutInfo: null,
				yogaNode: null,
				metadata: baseMetadata,
			} as RootNode;

		case NodeType.TEXT:
			return {
				id,
				type: NodeType.TEXT,
				props: {},
				children: [],
				parent: null,
				layoutInfo: null,
				yogaNode: null,
				metadata: baseMetadata,
				textContent: "",
				styledContent: [],
			} as TextNode;

		case NodeType.BOX:
			return {
				id,
				type: NodeType.BOX,
				props: {},
				children: [],
				parent: null,
				layoutInfo: null,
				yogaNode: null,
				metadata: baseMetadata,
			} as BoxNode;

		case NodeType.NEWLINE:
			return {
				id,
				type: NodeType.NEWLINE,
				props: {},
				children: [],
				parent: null,
				layoutInfo: null,
				yogaNode: null,
				metadata: baseMetadata,
				count: 1,
			} as NewlineNode;

		case NodeType.SPACER:
			return {
				id,
				type: NodeType.SPACER,
				props: {},
				children: [],
				parent: null,
				layoutInfo: null,
				yogaNode: null,
				metadata: baseMetadata,
			} as SpacerNode;

		case NodeType.STATIC:
			return {
				id,
				type: NodeType.STATIC,
				props: { items: [], children: () => null },
				children: [],
				parent: null,
				layoutInfo: null,
				yogaNode: null,
				metadata: baseMetadata,
				frozenContent: "",
			} as StaticNode;

		case NodeType.TRANSFORM:
			return {
				id,
				type: NodeType.TRANSFORM,
				props: { transform: (s) => s, children: null },
				children: [],
				parent: null,
				layoutInfo: null,
				yogaNode: null,
				metadata: baseMetadata,
				transformedContent: "",
			} as TransformNode;

		default:
			// TypeScript should catch this, but adding runtime check for safety
			throw new Error(`Unknown node type: ${type}`);
	}
}

/**
 * Type guard to check if a node is a TextNode
 */
export function isTextNode(node: RenderNode): node is TextNode {
	return node.type === NodeType.TEXT;
}

/**
 * Type guard to check if a node is a BoxNode
 */
export function isBoxNode(node: RenderNode): node is BoxNode {
	return node.type === NodeType.BOX;
}

/**
 * Type guard to check if a node is a NewlineNode
 */
export function isNewlineNode(node: RenderNode): node is NewlineNode {
	return node.type === NodeType.NEWLINE;
}

/**
 * Type guard to check if a node is a SpacerNode
 */
export function isSpacerNode(node: RenderNode): node is SpacerNode {
	return node.type === NodeType.SPACER;
}

/**
 * Type guard to check if a node is a StaticNode
 */
export function isStaticNode(node: RenderNode): node is StaticNode {
	return node.type === NodeType.STATIC;
}

/**
 * Type guard to check if a node is a TransformNode
 */
export function isTransformNode(node: RenderNode): node is TransformNode {
	return node.type === NodeType.TRANSFORM;
}

/**
 * Type guard to check if a node is a RootNode
 */
export function isRootNode(node: RenderNode): node is RootNode {
	return node.type === NodeType.ROOT;
}
