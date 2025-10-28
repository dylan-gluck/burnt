# Data Model Specification: Ink Port to Bun and Effect

## Overview

This document defines the core data structures for the Ink port, including render tree nodes, layout information, terminal state, reconciliation data, and Effect service contracts. All structures use pseudocode with TypeScript-like syntax and Effect Schema for validation.

## Core Principles

1. **Immutability**: All data structures are immutable; updates create new versions
2. **Type Safety**: Effect Schema validation for runtime type checking
3. **Effect Integration**: Services and errors follow Effect patterns
4. **Performance**: Structures optimized for diffing and incremental updates

---

## 1. Render Tree Data Structures

### 1.1 Node Types

```typescript
enum NodeType {
  ROOT = "root",
  TEXT = "text",
  BOX = "box",
  NEWLINE = "newline",
  SPACER = "spacer",
  STATIC = "static",
  TRANSFORM = "transform"
}
```

### 1.2 Base Render Node

```typescript
interface RenderNode {
  id: string;                    // Unique node identifier
  type: NodeType;                // Node type discriminator
  props: Record<string, unknown>; // Component props
  children: RenderNode[];        // Child nodes
  parent: RenderNode | null;     // Parent node reference
  layoutInfo: LayoutInfo | null; // Calculated layout (set by Yoga)
  yogaNode: YogaNode | null;     // Yoga node reference
  metadata: NodeMetadata;        // Reconciliation metadata
}

interface NodeMetadata {
  key: string | null;            // React key
  fiberNode: FiberNode | null;   // React fiber reference
  mounted: boolean;              // Mount status
  needsLayout: boolean;          // Layout dirty flag
  needsRender: boolean;          // Render dirty flag
}
```

### 1.3 Text Node

```typescript
interface TextNode extends RenderNode {
  type: NodeType.TEXT;
  props: TextProps;
  textContent: string;           // Actual text content
  styledContent: StyledText[];   // Styled text segments
}

interface TextProps {
  color?: Color;
  backgroundColor?: Color;
  dimColor?: boolean;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  inverse?: boolean;
  wrap?: "wrap" | "truncate" | "truncate-start" | "truncate-middle" | "truncate-end";
}

interface StyledText {
  text: string;
  styles: TextStyle;
}

interface TextStyle {
  foreground?: RGBColor;
  background?: RGBColor;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strikethrough: boolean;
  inverse: boolean;
  dim: boolean;
}

type Color =
  | string                        // Named color (e.g., "red", "blue")
  | { r: number; g: number; b: number } // RGB
  | { h: number; s: number; l: number }; // HSL
```

### 1.4 Box Node

```typescript
interface BoxNode extends RenderNode {
  type: NodeType.BOX;
  props: BoxProps;
}

interface BoxProps {
  // Dimensions
  width?: number | string;       // e.g., 20, "50%"
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
  flexDirection?: "row" | "column" | "row-reverse" | "column-reverse";
  justifyContent?: "flex-start" | "flex-end" | "center" | "space-between" | "space-around";
  alignItems?: "flex-start" | "flex-end" | "center" | "stretch";
  alignSelf?: "auto" | "flex-start" | "flex-end" | "center" | "stretch";
  flexGrow?: number;
  flexShrink?: number;
  flexBasis?: number | string;

  // Positioning
  position?: "relative" | "absolute";
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;

  // Border
  borderStyle?: "single" | "double" | "round" | "bold" | "singleDouble" | "doubleSingle" | "classic";
  borderColor?: Color;
  borderDimColor?: boolean;
  borderTop?: boolean;
  borderRight?: boolean;
  borderBottom?: boolean;
  borderLeft?: boolean;
}
```

### 1.5 Special Nodes

```typescript
interface NewlineNode extends RenderNode {
  type: NodeType.NEWLINE;
  count: number;                 // Number of newlines (default 1)
}

interface SpacerNode extends RenderNode {
  type: NodeType.SPACER;
  // Inherits flexbox behavior from parent
}

interface StaticNode extends RenderNode {
  type: NodeType.STATIC;
  props: StaticProps;
  frozenContent: string;         // Rendered content that doesn't update
}

interface StaticProps {
  items: unknown[];
  children: (item: unknown, index: number) => ReactElement;
}

interface TransformNode extends RenderNode {
  type: NodeType.TRANSFORM;
  props: TransformProps;
  transformedContent: string;    // Result of transformation
}

interface TransformProps {
  transform: (text: string) => string;
  children: ReactNode;
}
```

### 1.6 Render Tree

```typescript
interface RenderTree {
  root: RenderNode;              // Root node
  nodeMap: Map<string, RenderNode>; // Fast node lookup by ID
  dirtyNodes: Set<string>;       // Nodes needing layout/render
  version: number;               // Tree version for change detection
}
```

---

## 2. Layout Data Structures

### 2.1 Layout Information

```typescript
interface LayoutInfo {
  x: number;                     // Absolute X position
  y: number;                     // Absolute Y position
  width: number;                 // Computed width
  height: number;                // Computed height
  left: number;                  // Left offset
  top: number;                   // Top offset
}
```

### 2.2 Yoga Node Wrapper

```typescript
interface YogaNode {
  nativeNode: unknown;           // Native Yoga node (opaque type)
  id: string;                    // Corresponding render node ID
  children: YogaNode[];          // Child Yoga nodes
  computed: boolean;             // Layout computed flag
}
```

### 2.3 Layout Calculation Request

```typescript
interface LayoutRequest {
  tree: RenderTree;
  terminalWidth: number;
  terminalHeight: number;
  dirtyNodes: Set<string>;       // Nodes to recalculate
}

interface LayoutResult {
  tree: RenderTree;              // Updated tree with layout info
  layoutTime: number;            // Calculation duration (ms)
  nodesCalculated: number;       // Number of nodes processed
}
```

---

## 3. Terminal Output Data Structures

### 3.1 Output Buffer

```typescript
interface OutputBuffer {
  lines: OutputLine[];           // Terminal lines
  width: number;                 // Terminal width
  height: number;                // Terminal height
  cursorX: number;               // Cursor column
  cursorY: number;               // Cursor row
  alternateScreen: boolean;      // Using alternate screen buffer
}

interface OutputLine {
  content: OutputSegment[];      // Styled segments
  cleared: boolean;              // Line needs clearing
}

interface OutputSegment {
  text: string;
  style: TerminalStyle;
}

interface TerminalStyle {
  foreground: RGBColor | null;
  background: RGBColor | null;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strikethrough: boolean;
  inverse: boolean;
  dim: boolean;
}

interface RGBColor {
  r: number;                     // 0-255
  g: number;                     // 0-255
  b: number;                     // 0-255
}
```

### 3.2 ANTML Output

```typescript
interface ANTMLOutput {
  content: string;               // Escape sequences + text
  commands: ANTMLCommand[];      // Structured commands
}

interface ANTMLCommand {
  type: ANTMLCommandType;
  params: unknown[];
}

enum ANTMLCommandType {
  CLEAR_SCREEN = "clearScreen",
  MOVE_CURSOR = "moveCursor",
  SET_FOREGROUND = "setForeground",
  SET_BACKGROUND = "setBackground",
  RESET_STYLE = "resetStyle",
  SET_BOLD = "setBold",
  SET_ITALIC = "setItalic",
  SET_UNDERLINE = "setUnderline",
  SET_STRIKETHROUGH = "setStrikethrough",
  SET_INVERSE = "setInverse",
  SET_DIM = "setDim",
  SHOW_CURSOR = "showCursor",
  HIDE_CURSOR = "hideCursor",
  ENTER_ALTERNATE_SCREEN = "enterAlternateScreen",
  EXIT_ALTERNATE_SCREEN = "exitAlternateScreen"
}
```

### 3.3 Output Diff

```typescript
interface OutputDiff {
  operations: OutputOperation[];
  previousBuffer: OutputBuffer;
  currentBuffer: OutputBuffer;
}

interface OutputOperation {
  type: "write" | "clear" | "moveCursor";
  line: number;
  column: number;
  content?: string;
  style?: TerminalStyle;
}
```

---

## 4. Input Data Structures

### 4.1 Input Event

```typescript
interface InputEvent {
  type: InputEventType;
  data: KeyPress | MouseEvent | ResizeEvent;
  timestamp: number;
}

enum InputEventType {
  KEYPRESS = "keypress",
  MOUSE = "mouse",
  RESIZE = "resize"
}

interface KeyPress {
  input: string;                 // Raw input string
  key: Key;                      // Parsed key information
}

interface Key {
  name?: string;                 // Key name (e.g., "return", "space")
  ctrl: boolean;
  meta: boolean;
  shift: boolean;
  sequence: string;              // Raw sequence
  raw: string;                   // Raw input
}

interface MouseEvent {
  x: number;
  y: number;
  button: "left" | "right" | "middle" | "none";
  action: "press" | "release" | "move" | "scroll";
}

interface ResizeEvent {
  width: number;
  height: number;
}
```

### 4.2 Focus State

```typescript
interface FocusState {
  focusedNodeId: string | null;  // Currently focused node
  focusableNodes: string[];      // IDs of focusable nodes (in order)
  autoFocus: boolean;            // Auto-focus first node
}

interface FocusManager {
  state: FocusState;
  focus: (nodeId: string) => Effect<void, FocusError>;
  focusNext: () => Effect<void, FocusError>;
  focusPrevious: () => Effect<void, FocusError>;
  enableFocus: (nodeId: string) => Effect<void, never>;
  disableFocus: (nodeId: string) => Effect<void, never>;
}
```

---

## 5. Reconciliation Data Structures

### 5.1 Update Queue

```typescript
interface UpdateQueue {
  pendingUpdates: Update[];
  processingUpdate: Update | null;
  version: number;
}

interface Update {
  id: string;
  type: UpdateType;
  payload: UpdatePayload;
  priority: UpdatePriority;
  timestamp: number;
}

enum UpdateType {
  MOUNT = "mount",
  UPDATE = "update",
  UNMOUNT = "unmount",
  REORDER = "reorder"
}

type UpdatePayload =
  | MountPayload
  | UpdatePayload
  | UnmountPayload
  | ReorderPayload;

interface MountPayload {
  node: RenderNode;
  parentId: string;
  index: number;
}

interface UpdatePayload {
  nodeId: string;
  props: Record<string, unknown>;
  children: RenderNode[];
}

interface UnmountPayload {
  nodeId: string;
}

interface ReorderPayload {
  parentId: string;
  childIds: string[];
}

enum UpdatePriority {
  IMMEDIATE = 0,
  USER_BLOCKING = 1,
  NORMAL = 2,
  LOW = 3,
  IDLE = 4
}
```

### 5.2 Reconciliation Result

```typescript
interface ReconciliationResult {
  tree: RenderTree;
  updates: Update[];
  layoutNeeded: boolean;
  renderNeeded: boolean;
}
```

---

## 6. Effect Services

### 6.1 Service Identifiers

```typescript
// Service type definitions
interface RendererService {
  readonly _tag: "RendererService";
  render: (tree: RenderTree) => Effect<void, RenderError>;
  mount: (element: ReactElement) => Effect<RenderTree, RenderError>;
  unmount: () => Effect<void, RenderError>;
  update: (updates: Update[]) => Effect<RenderTree, RenderError>;
}

interface LayoutService {
  readonly _tag: "LayoutService";
  calculate: (request: LayoutRequest) => Effect<LayoutResult, LayoutError>;
  createYogaNode: (renderNode: RenderNode) => Effect<YogaNode, LayoutError>;
  destroyYogaNode: (yogaNode: YogaNode) => Effect<void, LayoutError>;
  applyStyles: (yogaNode: YogaNode, props: BoxProps) => Effect<void, LayoutError>;
}

interface TerminalService {
  readonly _tag: "TerminalService";
  write: (output: ANTMLOutput) => Effect<void, TerminalError>;
  clear: () => Effect<void, TerminalError>;
  enterAlternateScreen: () => Effect<void, TerminalError>;
  exitAlternateScreen: () => Effect<void, TerminalError>;
  showCursor: () => Effect<void, TerminalError>;
  hideCursor: () => Effect<void, TerminalError>;
  getSize: () => Effect<TerminalSize, TerminalError>;
}

interface TerminalSize {
  width: number;
  height: number;
}

interface InputService {
  readonly _tag: "InputService";
  startCapture: () => Effect<void, InputError>;
  stopCapture: () => Effect<void, InputError>;
  getInputStream: () => Stream<InputEvent, InputError>;
  setRawMode: (enabled: boolean) => Effect<void, InputError>;
}

interface OutputGeneratorService {
  readonly _tag: "OutputGeneratorService";
  generate: (tree: RenderTree) => Effect<OutputBuffer, OutputError>;
  diff: (previous: OutputBuffer, current: OutputBuffer) => Effect<OutputDiff, OutputError>;
  toANTML: (diff: OutputDiff) => Effect<ANTMLOutput, OutputError>;
}
```

### 6.2 Service Context

```typescript
interface AppContext {
  renderer: RendererService;
  layout: LayoutService;
  terminal: TerminalService;
  input: InputService;
  outputGenerator: OutputGeneratorService;
  focusManager: FocusManager;
  config: AppConfig;
}

interface AppConfig {
  debug: boolean;
  exitOnCtrlC: boolean;
  patchConsole: boolean;
  stdin: Readable;
  stdout: Writable;
  stderr: Writable;
}
```

---

## 7. Error Types

### 7.1 Tagged Errors

```typescript
interface RenderError {
  readonly _tag: "RenderError";
  readonly message: string;
  readonly cause?: unknown;
  readonly nodeId?: string;
}

interface LayoutError {
  readonly _tag: "LayoutError";
  readonly message: string;
  readonly cause?: unknown;
  readonly nodeId?: string;
}

interface TerminalError {
  readonly _tag: "TerminalError";
  readonly message: string;
  readonly cause?: unknown;
}

interface InputError {
  readonly _tag: "InputError";
  readonly message: string;
  readonly cause?: unknown;
}

interface OutputError {
  readonly _tag: "OutputError";
  readonly message: string;
  readonly cause?: unknown;
}

interface FocusError {
  readonly _tag: "FocusError";
  readonly message: string;
  readonly nodeId?: string;
}

// Union type for all errors
type InkError =
  | RenderError
  | LayoutError
  | TerminalError
  | InputError
  | OutputError
  | FocusError;
```

---

## 8. React Integration Types

### 8.1 Reconciler Host Config

```typescript
interface HostConfig {
  // Instance types
  type Instance = RenderNode;
  type TextInstance = TextNode;
  type Container = RenderTree;
  type HostContext = AppContext;

  // Update payloads
  type UpdatePayload = Partial<RenderNode["props"]>;

  // Lifecycle methods (signatures only, implementation in Backend Spec)
  createInstance: (type, props, container, hostContext) => Instance;
  createTextInstance: (text, container, hostContext) => TextInstance;
  appendInitialChild: (parent, child) => void;
  appendChild: (parent, child) => void;
  removeChild: (parent, child) => void;
  insertBefore: (parent, child, beforeChild) => void;
  commitUpdate: (instance, updatePayload) => void;
  commitTextUpdate: (textInstance, oldText, newText) => void;
  // ... additional reconciler methods
}
```

### 8.2 React Context Types

```typescript
interface AppContextValue {
  exit: (error?: Error) => void;
}

interface StdinContextValue {
  stdin: Readable;
  setRawMode: (value: boolean) => void;
  isRawModeSupported: boolean;
  internal_exitOnCtrlC: boolean;
}

interface StdoutContextValue {
  stdout: Writable;
  write: (data: string) => void;
}

interface StderrContextValue {
  stderr: Writable;
  write: (data: string) => void;
}

interface FocusContextValue {
  focusManager: FocusManager;
  focusedNodeId: string | null;
}
```

---

## 9. Schema Definitions (Effect Schema)

### 9.1 Component Prop Schemas

```typescript
// Schema for Text props validation
const TextPropsSchema = Schema.Struct({
  color: Schema.optional(Schema.String),
  backgroundColor: Schema.optional(Schema.String),
  dimColor: Schema.optional(Schema.Boolean),
  bold: Schema.optional(Schema.Boolean),
  italic: Schema.optional(Schema.Boolean),
  underline: Schema.optional(Schema.Boolean),
  strikethrough: Schema.optional(Schema.Boolean),
  inverse: Schema.optional(Schema.Boolean),
  wrap: Schema.optional(Schema.Literal("wrap", "truncate", "truncate-start", "truncate-middle", "truncate-end"))
});

// Schema for Box props validation
const BoxPropsSchema = Schema.Struct({
  width: Schema.optional(Schema.Union(Schema.Number, Schema.String)),
  height: Schema.optional(Schema.Union(Schema.Number, Schema.String)),
  // ... all other box props
});

// Schema for RenderNode validation
const RenderNodeSchema = Schema.Struct({
  id: Schema.String,
  type: Schema.Literal(...Object.values(NodeType)),
  props: Schema.Record(Schema.String, Schema.Unknown),
  children: Schema.Array(Schema.Any), // Recursive type
  parent: Schema.NullOr(Schema.Any),
  layoutInfo: Schema.NullOr(LayoutInfoSchema),
  yogaNode: Schema.NullOr(Schema.Unknown),
  metadata: NodeMetadataSchema
});
```

---

## 10. Performance Optimization Types

### 10.1 Render Batch

```typescript
interface RenderBatch {
  updates: Update[];
  layoutRequests: LayoutRequest[];
  outputGeneration: OutputBuffer | null;
  priority: UpdatePriority;
  startTime: number;
}
```

### 10.2 Cache Types

```typescript
interface LayoutCache {
  nodeId: string;
  props: BoxProps;
  layoutInfo: LayoutInfo;
  version: number;
}

interface OutputCache {
  treeVersion: number;
  buffer: OutputBuffer;
  antml: ANTMLOutput;
}
```

---

## Data Model Summary

### Key Design Decisions

1. **Immutable Tree Structure**: Render tree is immutable; updates create new versions for safe concurrent access
2. **Typed Errors**: All errors are tagged unions for exhaustive compile-time error handling
3. **Effect Services**: Core functionality exposed through Effect services for composability and testability
4. **Layout Separation**: Layout information separated from render nodes for independent calculation
5. **Incremental Updates**: Dirty tracking on nodes enables efficient incremental rendering
6. **Schema Validation**: Runtime validation of all public API inputs via Effect Schema
7. **React Integration**: Host config types align with React Reconciler API requirements
8. **Performance Caching**: Layout and output caching structures for optimization

### Data Flow

```
React Component Props
  ↓ (validated via Schema)
RenderNode
  ↓ (processed by LayoutService)
LayoutInfo
  ↓ (processed by OutputGeneratorService)
OutputBuffer
  ↓ (diffed)
OutputDiff
  ↓ (converted)
ANTMLOutput
  ↓ (written by TerminalService)
Terminal Display
```

---

**Document Version**: 1.0
**Created**: 2025-10-27
**Status**: Draft
