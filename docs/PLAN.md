# Implementation Plan: Ink Port to Bun and Effect

## Overview

This plan outlines the phased implementation of porting the Ink CLI library to a Bun-native implementation leveraging Effect for type-safe error handling, resource management, and dependency injection while maintaining 100% API compatibility with the original Ink library.

**Key Objectives:**
- 100% API compatibility with Ink's public interface
- Leverage Effect for typed errors, services, and resource management
- Use Bun's native APIs and performance optimizations
- Integrate React 19 features (ref as prop, use() hook, Context as provider)
- Achieve 50%+ faster startup time and 30%+ lower memory usage vs. Ink

**Estimated Timeline:** 80-110 hours

**Architecture Approach:**
- Data structures first (render tree, layout info)
- Service layer with Effect patterns
- React reconciler integration
- Component and hook API last (following specs exactly)

---

## Phase 1: Project Setup & Infrastructure

**Objective:** Establish project foundation with Bun, Effect, React 19, and TypeScript configuration

### 1.1 Project Initialization

**Description:** Initialize project with Bun package manager and TypeScript configuration

**Assigned to:** Setup specialist

**Specification reference:** PRD.md > Platform Requirements

**Implementation steps:**
1. Initialize Bun project with `bun init`
2. Configure `package.json` with dependencies:
   - react@19.x
   - @effect/platform@latest
   - @effect/schema@latest
   - yoga-layout@latest (or FFI alternative)
   - @biomejs/biome@latest (dev)
   - @types/react@19.x (dev)
   - vitest@latest (dev)
3. Create `tsconfig.json` with strict TypeScript settings
4. Create `bunfig.toml` for Bun configuration
5. Set up Biome for linting and formatting (biome.json)
6. Create project directory structure:
   ```
   src/
     ├── components/
     ├── hooks/
     ├── services/
     ├── contexts/
     ├── reconciler/
     ├── utils/
     ├── types/
     └── index.ts
   ```

**Validation:**
- [ ] Bun runtime installed and working
- [ ] All dependencies install without errors
- [ ] TypeScript compiles with strict mode
- [ ] Biome linting passes with no errors
- [ ] Directory structure matches specification

**Estimated effort:** 1-2 hours

### 1.2 Development Tooling

**Description:** Set up build scripts, testing, and development workflow

**Assigned to:** Setup specialist

**Specification reference:** FRONTEND_SPEC.md > Testing and Development Setup

**Dependencies:** Task 1.1

**Implementation steps:**
1. Create `scripts/build.ts` using Bun.build API
2. Configure Vitest for testing (vitest.config.ts)
3. Set up test utilities structure in `src/__tests__/`
4. Create `scripts/dev.ts` for watch mode development
5. Add npm scripts to package.json (build, test, dev, lint)
6. Create .gitignore with appropriate exclusions
7. Set up CI configuration skeleton

**Validation:**
- [ ] `bun run build` produces dist output
- [ ] `bun test` runs Vitest successfully
- [ ] `bun run dev` watches for changes
- [ ] `bun run lint` runs Biome checks
- [ ] TypeScript compilation includes source maps

**Estimated effort:** 2-3 hours

---

## Phase 2: Core Data Structures

**Objective:** Implement render tree nodes, layout types, and Effect schemas

### 2.1 Render Node Types

**Description:** Create RenderNode type hierarchy with all node types

**Assigned to:** Backend specialist (Effect patterns)

**Specification reference:** DATA_MODEL.md > Section 1: Render Tree Data Structures

**Dependencies:** Phase 1 complete

**Implementation steps:**
1. Create `src/types/nodes.ts`
2. Define NodeType enum (ROOT, TEXT, BOX, NEWLINE, SPACER, STATIC, TRANSFORM)
3. Implement base RenderNode interface with:
   - id, type, props, children, parent
   - layoutInfo, yogaNode
   - metadata (key, fiberNode, mounted, needsLayout, needsRender)
4. Implement typed node interfaces:
   - TextNode with TextProps and textContent
   - BoxNode with BoxProps
   - NewlineNode with count
   - SpacerNode, StaticNode, TransformNode
5. Implement RenderTree interface with root, nodeMap, dirtyNodes, version
6. Add helper functions: createRenderTree(), createNode(type)

**Validation:**
- [ ] All node types from DATA_MODEL.md implemented
- [ ] TypeScript strict mode passes with no errors
- [ ] Node types are properly discriminated unions
- [ ] Helper functions create valid node structures
- [ ] Unit tests verify node creation and structure

**Estimated effort:** 3-4 hours

### 2.2 Layout and Terminal Types

**Description:** Implement layout information and terminal output types

**Assigned to:** Backend specialist

**Specification reference:** DATA_MODEL.md > Sections 2-3: Layout and Terminal Output

**Dependencies:** Task 2.1

**Implementation steps:**
1. Create `src/types/layout.ts`:
   - LayoutInfo interface (x, y, width, height, left, top)
   - YogaNode wrapper interface
   - LayoutRequest and LayoutResult interfaces
2. Create `src/types/terminal.ts`:
   - OutputBuffer with lines array
   - OutputLine with styled segments
   - OutputSegment with text and style
   - TerminalStyle with RGB colors
   - ANTMLOutput and ANTMLCommand types
   - OutputDiff and OutputOperation types
3. Create `src/types/input.ts`:
   - InputEvent, KeyPress, Key interfaces
   - MouseEvent and ResizeEvent types
   - FocusState and FocusManager interfaces

**Validation:**
- [ ] All types from DATA_MODEL.md sections 2-3 implemented
- [ ] Types properly reference each other (composition)
- [ ] No circular dependencies in type definitions
- [ ] Types compile without errors
- [ ] Unit tests verify type structure

**Estimated effort:** 2-3 hours

### 2.3 Effect Schemas

**Description:** Create Effect Schema definitions for runtime validation

**Assigned to:** Backend specialist (Effect patterns)

**Specification reference:** DATA_MODEL.md > Section 9: Schema Definitions

**Dependencies:** Task 2.1, 2.2

**Implementation steps:**
1. Create `src/schemas/props.ts`:
   - TextPropsSchema with all text styling properties
   - BoxPropsSchema with all layout properties
   - Validate color, wrap, flexbox values
2. Create `src/schemas/nodes.ts`:
   - RenderNodeSchema for node validation
   - LayoutInfoSchema
   - NodeMetadataSchema
3. Export decodeSync functions for each schema
4. Add JSDoc comments explaining validation rules
5. Write tests for schema validation (valid/invalid cases)

**Validation:**
- [ ] All schemas from DATA_MODEL.md implemented
- [ ] Schemas reject invalid inputs with clear errors
- [ ] Schemas accept all valid inputs
- [ ] decodeSync functions work correctly
- [ ] Tests cover edge cases (undefined, null, wrong types)

**Estimated effort:** 2-3 hours

### 2.4 Error Types

**Description:** Define tagged error types with Effect's Data.TaggedError

**Assigned to:** Backend specialist (Effect patterns)

**Specification reference:** DATA_MODEL.md > Section 7: Error Types

**Dependencies:** Phase 2.1-2.3

**Implementation steps:**
1. Create `src/errors/index.ts`
2. Define tagged error classes:
   - RenderError with message, cause, nodeId
   - LayoutError with message, cause, nodeId
   - TerminalError with message, cause
   - InputError with message, cause
   - OutputError with message, cause, nodeId
   - FocusError with message, nodeId
3. Export InkError union type
4. Add helper functions for creating errors
5. Write tests for error creation and properties

**Validation:**
- [ ] All error types from DATA_MODEL.md implemented
- [ ] Errors use Data.TaggedError pattern
- [ ] _tag property correctly set on all errors
- [ ] Union type InkError includes all error types
- [ ] Tests verify error structure and serialization

**Estimated effort:** 1-2 hours

---

## Phase 3: Yoga Layout Integration

**Objective:** Integrate Yoga layout engine via FFI or npm package

### 3.1 Yoga Integration Strategy Decision

**Description:** Evaluate and choose between Bun FFI and yoga-layout npm package

**Assigned to:** Integration specialist

**Specification reference:** PRD.md > Open Questions, FRONTEND_SPEC.md > Bun FFI Patterns

**Dependencies:** Phase 2 complete

**Implementation steps:**
1. Research yoga-layout npm package compatibility with Bun
2. Test Bun FFI capabilities with Yoga C++ library
3. Benchmark both approaches (performance, complexity)
4. Document decision with pros/cons
5. Create integration abstraction layer

**Validation:**
- [ ] Both approaches tested and benchmarked
- [ ] Decision documented with rationale
- [ ] Abstraction layer allows switching if needed
- [ ] Performance meets requirements (<5ms layout calculation)

**Estimated effort:** 3-4 hours

### 3.2 Yoga Engine Implementation

**Description:** Implement Yoga layout engine integration (FFI or npm package)

**Assigned to:** Backend specialist (Bun native APIs)

**Specification reference:** FRONTEND_SPEC.md > Section 6.2: FFI Patterns for Yoga Integration

**Dependencies:** Task 3.1 (strategy decided)

**Implementation steps:**

**If FFI approach:**
1. Create `src/platform/bun/yoga-ffi.ts`
2. Use `dlopen` to load Yoga shared library
3. Define FFI symbols for all Yoga functions needed
4. Implement YogaNode class wrapper
5. Implement YogaNodePool for object pooling
6. Add error handling for FFI calls
7. Write tests for Yoga operations

**If npm package approach:**
1. Install yoga-layout package
2. Create `src/platform/yoga-wrapper.ts`
3. Wrap yoga-layout API with Effect patterns
4. Implement YogaNode wrapper class
5. Add resource management with Effect.acquireRelease
6. Write tests for Yoga operations

**Common steps:**
7. Create utility functions for converting BoxProps to Yoga styles
8. Test basic layout scenarios (row, column, flex, padding, margin)
9. Benchmark layout performance

**Validation:**
- [ ] Yoga integration works without errors
- [ ] All Yoga layout properties supported
- [ ] Layout calculation produces correct positions
- [ ] Resource cleanup works (no memory leaks)
- [ ] Performance meets <5ms requirement
- [ ] Unit tests cover all layout scenarios
- [ ] Object pooling reduces allocations (if FFI)

**Estimated effort:** 6-8 hours

---

## Phase 4: Effect Services Layer (Foundation)

**Objective:** Implement core Effect services for terminal, output generation, and layout

### 4.1 TerminalService

**Description:** Implement terminal I/O service with Effect patterns

**Assigned to:** Backend specialist (Effect patterns)

**Specification reference:** BACKEND_SPEC.md > Section 1.3: TerminalService

**Dependencies:** Phase 2 and 3 complete

**Implementation steps:**
1. Create `src/services/TerminalService.ts`
2. Define TerminalService interface with all methods:
   - write, clear, enterAlternateScreen, exitAlternateScreen
   - showCursor, hideCursor, getSize
   - onResize stream
3. Implement TerminalServiceImpl with:
   - Write queue for batching (Effect.Queue)
   - Resize event queue (Effect.Queue)
   - Background write loop fiber
   - ANSI escape sequence generation
4. Create service using Effect.Service pattern
5. Implement scoped lifecycle with:
   - Enter alternate screen on creation
   - Exit alternate screen on cleanup (finalizer)
   - SIGWINCH handler for resize events
6. Write tests with mock stdout/stdin

**Validation:**
- [ ] All methods from BACKEND_SPEC.md implemented
- [ ] Write batching works within 16ms window
- [ ] Resize events captured and emitted as stream
- [ ] Alternate screen enter/exit works
- [ ] Finalizer restores terminal on cleanup
- [ ] Tests verify batching and queueing behavior
- [ ] No resource leaks in tests

**Estimated effort:** 4-5 hours

### 4.2 OutputGeneratorService

**Description:** Convert render tree to terminal output with ANSI codes

**Assigned to:** Backend specialist (Effect patterns)

**Specification reference:** BACKEND_SPEC.md > Section 1.5: OutputGeneratorService

**Dependencies:** Task 4.1

**Implementation steps:**
1. Create `src/services/OutputGeneratorService.ts`
2. Implement OutputGeneratorServiceImpl with methods:
   - generate(tree) → OutputBuffer
   - diff(previous, current) → OutputDiff
   - toANTML(diff) → ANTMLOutput
3. Implement traverseAndRender with parallel processing
4. Implement renderTextNode and renderBoxNode
5. Implement line-by-line diffing algorithm
6. Implement diff optimization (merge consecutive writes)
7. Implement ANSI color code generation (RGB)
8. Add text styling (bold, italic, underline, strikethrough)
9. Add border rendering for Box components
10. Write tests for rendering and diffing

**Validation:**
- [ ] generate() produces correct OutputBuffer
- [ ] diff() identifies minimal changes
- [ ] Optimization merges consecutive writes
- [ ] toANTML() produces valid ANSI codes
- [ ] Text styling works (colors, bold, etc.)
- [ ] Border rendering works for all styles
- [ ] Tests verify output matches expected
- [ ] Performance acceptable for large trees

**Estimated effort:** 5-6 hours

### 4.3 LayoutService

**Description:** Manage Yoga layout calculations with caching

**Assigned to:** Backend specialist (Effect patterns)

**Specification reference:** BACKEND_SPEC.md > Section 1.2: LayoutService

**Dependencies:** Task 3.2 (Yoga integration), Task 2.1-2.2 (types)

**Implementation steps:**
1. Create `src/services/LayoutService.ts`
2. Implement LayoutServiceImpl with:
   - calculate(request) → LayoutResult (with caching)
   - createYogaNode(renderNode) → YogaNode
   - destroyYogaNode(yogaNode) → void
   - applyStyles(yogaNode, props) → void
3. Integrate Effect.Cache with TTL (100ms)
4. Implement performLayout with Yoga API calls
5. Implement extractLayoutInfo with parallel traversal
6. Add resource management for Yoga nodes
7. Map BoxProps to Yoga style properties
8. Write tests with mock Yoga nodes

**Validation:**
- [ ] All methods from BACKEND_SPEC.md implemented
- [ ] Layout calculation works correctly
- [ ] Caching reduces redundant calculations
- [ ] Resource cleanup prevents memory leaks
- [ ] Props correctly mapped to Yoga styles
- [ ] Parallel traversal extracts layout info
- [ ] Tests verify layout correctness
- [ ] Performance meets <5ms requirement

**Estimated effort:** 5-6 hours

### 4.4 InputService

**Description:** Capture keyboard and mouse input as Effect stream

**Assigned to:** Backend specialist (Effect patterns)

**Specification reference:** BACKEND_SPEC.md > Section 1.4: InputService

**Dependencies:** Task 4.1 (TerminalService patterns)

**Implementation steps:**
1. Create `src/services/InputService.ts`
2. Implement InputServiceImpl with:
   - inputStream property (Stream of InputEvent)
   - startCapture() → Effect
   - stopCapture() → Effect
   - setRawMode(enabled) → Effect
3. Implement input parsing for special keys:
   - Arrow keys, Enter, Tab, Escape
   - Ctrl combinations (Ctrl+C, etc.)
   - Regular characters
4. Queue input events with Effect.Queue
5. Add scoped lifecycle with auto cleanup
6. Handle exitOnCtrlC option
7. Write tests with mock stdin

**Validation:**
- [ ] Input stream emits events correctly
- [ ] Special keys parsed correctly
- [ ] Raw mode enables/disables
- [ ] Ctrl+C exits if exitOnCtrlC=true
- [ ] Resource cleanup stops capture
- [ ] Tests verify event parsing
- [ ] No memory leaks in stream processing

**Estimated effort:** 3-4 hours

### 4.5 FocusManagerService

**Description:** Manage keyboard focus state with reactive updates

**Assigned to:** Backend specialist (Effect patterns)

**Specification reference:** BACKEND_SPEC.md > Section 1.6: FocusManagerService

**Dependencies:** Task 4.4 (InputService)

**Implementation steps:**
1. Create `src/services/FocusManagerService.ts`
2. Implement FocusManagerServiceImpl with:
   - focusState (SubscriptionRef)
   - focus(nodeId) → Effect
   - focusNext() → Effect
   - focusPrevious() → Effect
   - enableFocus(nodeId) → Effect
   - disableFocus(nodeId) → Effect
   - onFocusChange stream
3. Use SubscriptionRef for reactive state
4. Implement focus navigation logic
5. Add auto-focus support
6. Write tests for focus management

**Validation:**
- [ ] Focus state updates reactively
- [ ] Navigation (next/previous) works correctly
- [ ] enableFocus/disableFocus manage focusable nodes
- [ ] onFocusChange stream emits on focus changes
- [ ] Auto-focus works when enabled
- [ ] Tests verify all focus operations
- [ ] Concurrent updates handled correctly

**Estimated effort:** 3-4 hours

---

## Phase 5: React Reconciler Integration

**Objective:** Implement React reconciler host config for terminal rendering

### 5.1 Reconciler Host Config

**Description:** Create React reconciler configuration for Ink elements

**Assigned to:** Frontend specialist (React internals)

**Specification reference:** FRONTEND_SPEC.md > Section 7: React 19 Reconciler Configuration

**Dependencies:** Phase 4 complete, Phase 2 (types)

**Implementation steps:**
1. Install react-reconciler package
2. Create `src/reconciler/config.ts`
3. Define host config with all required methods:
   - createInstance(type, props)
   - createTextInstance(text)
   - appendChild, appendChildToContainer
   - removeChild, removeChildFromContainer
   - insertBefore
   - finalizeInitialChildren
   - prepareUpdate(oldProps, newProps)
   - commitUpdate, commitTextUpdate
   - getPublicInstance (ref support)
4. Implement instance creation for all node types
5. Implement props diffing for updates
6. Add React DevTools integration (development)
7. Export reconciler instance
8. Write tests for reconciler operations

**Validation:**
- [ ] All host config methods implemented
- [ ] React 19 features supported (ref as prop, etc.)
- [ ] Instance creation works for all types
- [ ] Props updates trigger re-renders
- [ ] Children management works correctly
- [ ] DevTools integration works in dev mode
- [ ] Tests verify reconciler behavior

**Estimated effort:** 6-8 hours

### 5.2 Container Implementation

**Description:** Implement container for reconciler root

**Assigned to:** Frontend specialist

**Specification reference:** DATA_MODEL.md > React Integration Types

**Dependencies:** Task 5.1

**Implementation steps:**
1. Create `src/reconciler/container.ts`
2. Implement Container class with:
   - RenderTree instance
   - appendChild, removeChild, insertBefore methods
   - clear() method
   - render() method to trigger output
3. Integrate with RendererService
4. Add cleanup handling
5. Write tests for container operations

**Validation:**
- [ ] Container manages render tree correctly
- [ ] Child operations update tree
- [ ] render() triggers layout and output
- [ ] Cleanup works without errors
- [ ] Tests verify container behavior

**Estimated effort:** 2-3 hours

---

## Phase 6: Renderer Service (Orchestration)

**Objective:** Implement main renderer service that orchestrates all other services

### 6.1 RendererService Implementation

**Description:** Create renderer service with fiber-based concurrency

**Assigned to:** Backend specialist (Effect patterns)

**Specification reference:** BACKEND_SPEC.md > Section 1.1: RendererService

**Dependencies:** Phase 4 (all services), Phase 5 (reconciler)

**Implementation steps:**
1. Create `src/services/RendererService.ts`
2. Implement RendererServiceImpl with:
   - mount(element) → Effect<RenderTree>
   - render(tree) → Effect<void>
   - unmount() → Effect<void>
   - update(updates) → Effect<RenderTree>
   - waitUntilExit() → Effect<void>
   - renderLoop stream
3. Implement mount logic:
   - Create container
   - Initialize reconciler
   - Start render loop fiber
4. Implement render loop with:
   - Update queue stream
   - Batching within 16ms window
   - Layout calculation
   - Output generation and write
5. Implement processBatchedUpdates with error recovery
6. Add graceful unmount with cleanup
7. Create service using Effect.Service with dependencies
8. Write tests with mock services

**Validation:**
- [ ] All methods from BACKEND_SPEC.md implemented
- [ ] mount() creates and initializes correctly
- [ ] Render loop processes updates in batches
- [ ] Layout and output generation work together
- [ ] Error recovery prevents crashes
- [ ] unmount() cleans up resources
- [ ] Tests verify orchestration logic
- [ ] No fiber leaks or memory leaks

**Estimated effort:** 7-9 hours

### 6.2 Layer Composition

**Description:** Compose all services into application layer

**Assigned to:** Backend specialist (Effect patterns)

**Specification reference:** BACKEND_SPEC.md > Section 2: Layer Composition

**Dependencies:** Task 6.1, Phase 4 (all services)

**Implementation steps:**
1. Create `src/layers/index.ts`
2. Define layer structure:
   - InfrastructureLayer (Terminal, Input, OutputGenerator)
   - LayoutLayer
   - RendererLayer
   - AppLayer (merges all)
3. Implement makeAppLayer(config) for custom config
4. Add AppConfig service
5. Export all layers
6. Write tests for layer composition

**Validation:**
- [ ] Layers compose without circular dependencies
- [ ] Dependencies properly declared
- [ ] AppLayer provides all services
- [ ] Custom config works with makeAppLayer
- [ ] Tests verify layer provision

**Estimated effort:** 2-3 hours

---

## Phase 7: React Components

**Objective:** Implement all Ink-compatible React components

### 7.1 Text Component

**Description:** Implement Text component with styling props

**Assigned to:** Frontend specialist

**Specification reference:** FRONTEND_SPEC.md > Section 1.1: Text Component

**Dependencies:** Phase 5 (reconciler), Task 2.3 (schemas)

**Implementation steps:**
1. Create `src/components/Text.tsx`
2. Implement TextProps interface matching Ink API
3. Implement Text component with:
   - forwardRef for ref support
   - Schema validation (memoized)
   - Text content extraction (memoized)
   - Color normalization (memoized)
   - createElement("TEXT", props)
4. Add displayName for debugging
5. Create color utilities in `src/utils/color.ts`:
   - normalizeColor with caching
   - hexToRgb, hslToRgb, namedColorToRgb
6. Write component tests

**Validation:**
- [ ] All props from FRONTEND_SPEC.md supported
- [ ] Color normalization works (hex, RGB, HSL, named)
- [ ] Text styling applied correctly
- [ ] Text wrapping modes work
- [ ] Memoization prevents unnecessary re-renders
- [ ] Component tests cover all props
- [ ] API matches Ink exactly

**Estimated effort:** 3-4 hours

### 7.2 Box Component

**Description:** Implement Box component with flexbox layout

**Assigned to:** Frontend specialist

**Specification reference:** FRONTEND_SPEC.md > Section 1.2: Box Component

**Dependencies:** Task 7.1 (component patterns)

**Implementation steps:**
1. Create `src/components/Box.tsx`
2. Implement BoxProps interface with all layout properties
3. Implement Box component with:
   - forwardRef for ref support
   - Schema validation (memoized)
   - Shorthand prop expansion (margin, padding, gap)
   - createElement("BOX", props, children)
4. Create props expansion utility in `src/utils/props.ts`
5. Add border style support
6. Write component tests

**Validation:**
- [ ] All props from FRONTEND_SPEC.md supported
- [ ] Shorthand props expand correctly
- [ ] Flexbox properties work
- [ ] Border rendering works
- [ ] Component tests cover all props
- [ ] API matches Ink exactly

**Estimated effort:** 3-4 hours

### 7.3 Newline Component

**Description:** Implement Newline component for line breaks

**Assigned to:** Frontend specialist

**Specification reference:** FRONTEND_SPEC.md > Section 1.3: Newline Component

**Dependencies:** Task 7.1

**Implementation steps:**
1. Create `src/components/Newline.tsx`
2. Implement NewlineProps with count property
3. Implement memoized component
4. Write component tests

**Validation:**
- [ ] count prop works correctly
- [ ] Default count is 1
- [ ] Memoization prevents re-renders
- [ ] Tests verify behavior
- [ ] API matches Ink exactly

**Estimated effort:** 1 hour

### 7.4 Spacer Component

**Description:** Implement Spacer component for flexible spacing

**Assigned to:** Frontend specialist

**Specification reference:** FRONTEND_SPEC.md > Section 1.4: Spacer Component

**Dependencies:** Task 7.1

**Implementation steps:**
1. Create `src/components/Spacer.tsx`
2. Implement memoized component
3. Ensure flex: 1 behavior in layout
4. Write component tests

**Validation:**
- [ ] Spacer behaves like flex: 1
- [ ] Works in row and column layouts
- [ ] Tests verify spacing behavior
- [ ] API matches Ink exactly

**Estimated effort:** 1 hour

### 7.5 Static Component

**Description:** Implement Static component for non-updating content

**Assigned to:** Frontend specialist

**Specification reference:** FRONTEND_SPEC.md > Section 1.5: Static Component

**Dependencies:** Task 7.1

**Implementation steps:**
1. Create `src/components/Static.tsx`
2. Implement StaticProps with items and children function
3. Deep memoize rendered content
4. Ensure reconciler skips updates for STATIC nodes
5. Write component tests

**Validation:**
- [ ] Content renders once and freezes
- [ ] children function called for each item
- [ ] Reconciler skips updates
- [ ] Tests verify static behavior
- [ ] API matches Ink exactly

**Estimated effort:** 2-3 hours

### 7.6 Transform Component

**Description:** Implement Transform component for text transformation

**Assigned to:** Frontend specialist

**Specification reference:** FRONTEND_SPEC.md > Section 1.6: Transform Component

**Dependencies:** Task 7.1

**Implementation steps:**
1. Create `src/components/Transform.tsx`
2. Implement TransformProps with transform function
3. Extract and transform text content (memoized)
4. Write component tests

**Validation:**
- [ ] transform function applied to text
- [ ] Memoization prevents redundant transforms
- [ ] Works with nested Text components
- [ ] Tests verify transformation
- [ ] API matches Ink exactly

**Estimated effort:** 1-2 hours

---

## Phase 8: React Hooks

**Objective:** Implement all Ink-compatible React hooks

### 8.1 Context Providers

**Description:** Implement all React context providers

**Assigned to:** Frontend specialist (React 19 features)

**Specification reference:** FRONTEND_SPEC.md > Section 3: Context Providers

**Dependencies:** Phase 7 (components need contexts)

**Implementation steps:**
1. Create `src/contexts/AppContext.tsx`:
   - AppContext with exit function
   - AppContextProvider component
2. Create `src/contexts/StdinContext.tsx`:
   - StdinContext with stdin, setRawMode
   - StdinContextProvider
3. Create `src/contexts/StdoutContext.tsx`:
   - StdoutContext with stdout, write
   - StdoutContextProvider
4. Create `src/contexts/StderrContext.tsx`:
   - StderrContext with stderr, write
   - StderrContextProvider
5. Create `src/contexts/FocusContext.tsx`:
   - FocusContext with focusManager, focusedNodeId
   - FocusContextProvider with stream subscription
6. Use React 19 Context as provider pattern
7. Write tests for each context

**Validation:**
- [ ] All contexts created with correct values
- [ ] Providers use React 19 pattern (no .Provider)
- [ ] Values memoized to prevent re-renders
- [ ] FocusContext subscribes to focus stream
- [ ] Tests verify context values
- [ ] API matches Ink exactly

**Estimated effort:** 3-4 hours

### 8.2 useInput Hook

**Description:** Implement useInput hook for keyboard capture

**Assigned to:** Frontend specialist

**Specification reference:** FRONTEND_SPEC.md > Section 2.1: useInput

**Dependencies:** Task 8.1 (contexts)

**Implementation steps:**
1. Create `src/hooks/useInput.ts`
2. Implement UseInputOptions interface
3. Implement useInput hook with:
   - Get InputService from context
   - Stable handler reference
   - Subscribe to input stream
   - Cleanup on unmount
4. Use React 19 use() hook
5. Write tests with mock InputService

**Validation:**
- [ ] Handler called on keyboard events
- [ ] isActive option works
- [ ] Cleanup stops subscription
- [ ] Stable references prevent effect churn
- [ ] Tests verify input handling
- [ ] API matches Ink exactly

**Estimated effort:** 2-3 hours

### 8.3 useApp Hook

**Description:** Implement useApp hook for app control

**Assigned to:** Frontend specialist

**Specification reference:** FRONTEND_SPEC.md > Section 2.2: useApp

**Dependencies:** Task 8.1

**Implementation steps:**
1. Create `src/hooks/useApp.ts`
2. Implement useApp hook with:
   - use() to get AppContext
   - Return exit function
3. Write tests

**Validation:**
- [ ] Returns exit function
- [ ] exit() terminates application
- [ ] Error passed to exit handler
- [ ] Tests verify exit behavior
- [ ] API matches Ink exactly

**Estimated effort:** 1 hour

### 8.4 Stream Hooks (useStdin, useStdout, useStderr)

**Description:** Implement hooks for stream access

**Assigned to:** Frontend specialist

**Specification reference:** FRONTEND_SPEC.md > Sections 2.3-2.5

**Dependencies:** Task 8.1

**Implementation steps:**
1. Create `src/hooks/useStdin.ts`:
   - Return stdin, setRawMode, isRawModeSupported
2. Create `src/hooks/useStdout.ts`:
   - Return stdout, write
3. Create `src/hooks/useStderr.ts`:
   - Return stderr, write
4. Use React 19 use() hook in all
5. Write tests for each hook

**Validation:**
- [ ] All hooks return correct values
- [ ] Stream references are stable
- [ ] Tests verify hook behavior
- [ ] API matches Ink exactly

**Estimated effort:** 2 hours

### 8.5 Focus Hooks (useFocus, useFocusManager)

**Description:** Implement hooks for focus management

**Assigned to:** Frontend specialist

**Specification reference:** FRONTEND_SPEC.md > Sections 2.6-2.7

**Dependencies:** Task 8.1 (FocusContext)

**Implementation steps:**
1. Create `src/hooks/useFocus.ts`:
   - Generate stable focus ID
   - Register/unregister with FocusManager
   - Return isFocused state
   - Support autoFocus option
2. Create `src/hooks/useFocusManager.ts`:
   - Return focus, focusNext, focusPrevious
   - Wrap with Effect runners
3. Write tests for both hooks

**Validation:**
- [ ] useFocus registers node correctly
- [ ] isFocused updates reactively
- [ ] autoFocus works
- [ ] useFocusManager navigation works
- [ ] Tests verify focus behavior
- [ ] API matches Ink exactly

**Estimated effort:** 3-4 hours

---

## Phase 9: Main API & Render Function

**Objective:** Implement main render() function and public API

### 9.1 Render Function

**Description:** Implement main render() function with Effect integration

**Assigned to:** Integration specialist (Effect + React)

**Specification reference:** FRONTEND_SPEC.md > Section 4: Main Render Function, BACKEND_SPEC.md > Section 9: Main Entry Point

**Dependencies:** Phase 6 (RendererService), Phase 8 (contexts and hooks)

**Implementation steps:**
1. Create `src/render.tsx`
2. Implement RenderOptions interface
3. Implement RenderResult interface
4. Implement render() function with:
   - Create App wrapper with all context providers
   - Create Effect program to mount
   - Run with AppLayer
   - Return result with rerender, unmount, waitUntilExit, clear
5. Implement createAppConfig helper
6. Add all context providers in correct order
7. Write integration tests

**Validation:**
- [ ] render() accepts ReactElement and options
- [ ] All contexts provided in correct order
- [ ] Effect program runs with proper layers
- [ ] Returns result with all methods
- [ ] Cleanup works on unmount
- [ ] Tests verify full render cycle
- [ ] API matches Ink exactly

**Estimated effort:** 4-5 hours

### 9.2 Public API Exports

**Description:** Create main index.ts with all public exports

**Assigned to:** Integration specialist

**Specification reference:** FRONTEND_SPEC.md > Section 11: Public API Surface

**Dependencies:** All previous phases

**Implementation steps:**
1. Create `src/index.ts`
2. Export all components (Text, Box, Newline, Spacer, Static, Transform)
3. Export all hooks (useInput, useApp, useStdin, useStdout, useStderr, useFocus, useFocusManager)
4. Export render function
5. Export all TypeScript types
6. Create `src/types/index.ts` for type exports
7. Write API documentation in JSDoc
8. Verify exports work in test build

**Validation:**
- [ ] All components exported
- [ ] All hooks exported
- [ ] render() exported
- [ ] All types exported
- [ ] No internal APIs leaked
- [ ] Build produces correct exports
- [ ] JSDoc documentation complete

**Estimated effort:** 2 hours

---

## Phase 10: Utilities & Optimizations

**Objective:** Implement utility functions and Bun-specific optimizations

### 10.1 Text Utilities

**Description:** Implement text extraction and manipulation utilities

**Assigned to:** Frontend specialist

**Specification reference:** FRONTEND_SPEC.md > Section 5.2: Text Extraction

**Dependencies:** Phase 7 (components use these)

**Implementation steps:**
1. Create `src/utils/text.ts`
2. Implement extractTextContent(children) with:
   - Fast path for primitives
   - String builder pattern for arrays
   - React element traversal
3. Add memoization for repeated extractions
4. Write tests for all node types

**Validation:**
- [ ] Extracts text from all React node types
- [ ] Handles nested elements
- [ ] Performance optimized (string builder)
- [ ] Tests verify correctness
- [ ] Edge cases handled (null, undefined, boolean)

**Estimated effort:** 2 hours

### 10.2 Bun Buffer Optimizations

**Description:** Implement Bun-specific buffer optimizations

**Assigned to:** Backend specialist (Bun native)

**Specification reference:** FRONTEND_SPEC.md > Section 6.1: Native API Usage

**Dependencies:** Task 4.1 (TerminalService)

**Implementation steps:**
1. Create `src/platform/bun/buffer.ts`
2. Implement BunOutputBuffer class with:
   - Uint8Array for fast writes
   - Auto-growing buffer
   - flush() method for Writable streams
3. Integrate with TerminalService
4. Benchmark vs. standard Buffer
5. Write tests

**Validation:**
- [ ] Buffer grows automatically
- [ ] flush() writes to stream
- [ ] Performance better than Buffer
- [ ] Tests verify correctness
- [ ] No memory leaks

**Estimated effort:** 2-3 hours

### 10.3 Performance Fast Paths

**Description:** Implement Bun-optimized fast paths

**Assigned to:** Backend specialist (Bun native)

**Specification reference:** FRONTEND_SPEC.md > Section 6.3: Performance Fast Paths

**Dependencies:** Various services

**Implementation steps:**
1. Create `src/optimizations/fast-paths.ts`
2. Implement ANSIBuilder for fast string concatenation
3. Implement memoizeProps with WeakMap caching
4. Implement fastDiff for minimal updates
5. Add performance benchmarks
6. Write tests

**Validation:**
- [ ] ANSIBuilder faster than string concat
- [ ] Prop memoization reduces computations
- [ ] fastDiff finds minimal changes
- [ ] Benchmarks show improvements
- [ ] Tests verify correctness

**Estimated effort:** 3-4 hours

---

## Phase 11: Testing & Quality Assurance

**Objective:** Comprehensive test coverage and quality checks

### 11.1 Unit Tests

**Description:** Write unit tests for all components and services

**Assigned to:** Testing specialist

**Specification reference:** PRD.md > Success Criteria (90%+ coverage)

**Dependencies:** All implementation phases

**Implementation steps:**
1. Write tests for all components (Text, Box, etc.)
2. Write tests for all hooks
3. Write tests for all services (using mock layers)
4. Write tests for utilities
5. Achieve 90%+ code coverage
6. Use Bun test runner with vitest
7. Add snapshot tests where appropriate

**Validation:**
- [ ] Code coverage ≥90%
- [ ] All public APIs tested
- [ ] Edge cases covered
- [ ] Tests run in CI
- [ ] Snapshots committed

**Estimated effort:** 8-10 hours

### 11.2 Integration Tests

**Description:** Test complete rendering flows

**Assigned to:** Testing specialist

**Specification reference:** BACKEND_SPEC.md > Section 7: Testing with Effect

**Dependencies:** Task 11.1

**Implementation steps:**
1. Create integration test utilities:
   - MockTerminalService
   - MockInputService
   - renderTest helper
2. Write tests for:
   - Mount → render → unmount cycle
   - Component updates trigger re-renders
   - Input handling flows
   - Focus management flows
   - Layout calculation integration
3. Test with mock layers
4. Write tests for error scenarios

**Validation:**
- [ ] All integration flows tested
- [ ] Mock layers work correctly
- [ ] Error handling tested
- [ ] Tests verify spec compliance
- [ ] No flaky tests

**Estimated effort:** 6-8 hours

### 11.3 Performance Benchmarks

**Description:** Benchmark performance against success criteria

**Assigned to:** Performance specialist

**Specification reference:** PRD.md > Non-Functional Requirements

**Dependencies:** All implementation complete

**Implementation steps:**
1. Create benchmark suite:
   - Startup time measurement
   - Render cycle timing
   - Layout calculation timing
   - Memory usage tracking
2. Compare against Ink baseline
3. Optimize bottlenecks if needed
4. Document performance characteristics
5. Add CI performance checks

**Validation:**
- [ ] Startup time <50ms (50%+ faster than Ink)
- [ ] Render cycle <16ms for 60fps
- [ ] Layout calculation <5ms
- [ ] Memory usage <20MB basic app (30%+ lower)
- [ ] Benchmarks run in CI

**Estimated effort:** 4-5 hours

### 11.4 API Compatibility Tests

**Description:** Verify 100% API compatibility with Ink

**Assigned to:** Testing specialist

**Specification reference:** PRD.md > Success Criteria

**Dependencies:** Task 11.1

**Implementation steps:**
1. Create test cases from Ink examples
2. Port existing Ink applications
3. Verify components render identically
4. Verify hooks behave identically
5. Test all prop combinations
6. Document any deviations (should be zero)

**Validation:**
- [ ] All Ink components work identically
- [ ] All Ink hooks work identically
- [ ] Existing Ink apps run without changes
- [ ] Visual output matches Ink
- [ ] Zero API breaking changes

**Estimated effort:** 5-6 hours

---

## Phase 12: Documentation & Examples

**Objective:** Complete API documentation and example applications

### 12.1 API Documentation

**Description:** Write comprehensive API documentation

**Assigned to:** Documentation specialist

**Specification reference:** PRD.md > Success Criteria (100% API docs)

**Dependencies:** Phase 9 (public API)

**Implementation steps:**
1. Write README.md with:
   - Quick start guide
   - Installation instructions
   - Basic usage examples
   - Link to full documentation
2. Write API.md documenting:
   - All components with props
   - All hooks with options
   - render() function
   - Error types
3. Add JSDoc comments to all public APIs
4. Generate TypeDoc documentation
5. Create migration guide from Ink

**Validation:**
- [ ] 100% of public API documented
- [ ] Examples run without errors
- [ ] JSDoc complete for all exports
- [ ] TypeDoc builds successfully
- [ ] Migration guide accurate

**Estimated effort:** 6-8 hours

### 12.2 Example Applications

**Description:** Create example applications demonstrating features

**Assigned to:** Documentation specialist

**Specification reference:** FRONTEND_SPEC.md > Section 12: Example Applications

**Dependencies:** Task 12.1

**Implementation steps:**
1. Create `examples/` directory
2. Implement basic.tsx (hello world)
3. Implement counter.tsx (state management)
4. Implement menu.tsx (focus and input)
5. Implement layout.tsx (complex layouts)
6. Implement form.tsx (input handling)
7. Add package.json for running examples
8. Document how to run each example

**Validation:**
- [ ] All examples run without errors
- [ ] Examples demonstrate key features
- [ ] Examples follow best practices
- [ ] Examples documented
- [ ] Examples tested in CI

**Estimated effort:** 4-5 hours

### 12.3 Migration Guide

**Description:** Create guide for migrating from Ink to Ink-Bun-Effect

**Assigned to:** Documentation specialist

**Specification reference:** PRD.md > Drop-in Replacement

**Dependencies:** Task 12.1

**Implementation steps:**
1. Create MIGRATION.md
2. Document installation changes (Bun requirement)
3. Document API compatibility (100%)
4. Document Effect integration points
5. Provide troubleshooting tips
6. Add side-by-side comparison examples

**Validation:**
- [ ] Migration steps clear and accurate
- [ ] Troubleshooting covers common issues
- [ ] Examples helpful
- [ ] No undocumented breaking changes

**Estimated effort:** 2-3 hours

---

## Validation Checkpoints

**After each phase:**
1. Run all tests (unit, integration)
2. Verify against specifications (DATA_MODEL, BACKEND_SPEC, FRONTEND_SPEC)
3. Check code quality (Biome linting passes)
4. Review for Effect patterns compliance
5. Get approval before next phase

**Final validation:**
- [ ] All phases completed
- [ ] All tests passing (unit, integration, E2E)
- [ ] Code coverage ≥90%
- [ ] Performance benchmarks meet criteria
- [ ] 100% API compatibility with Ink verified
- [ ] All documentation complete
- [ ] Examples run successfully
- [ ] Biome linting passes with no errors
- [ ] TypeScript strict mode passes
- [ ] Ready for production use

---

## Risk Mitigation

**Identified risks:**

1. **Yoga Layout Integration Complexity**
   - Impact: High - Core layout depends on it
   - Likelihood: Medium - FFI or npm package may have issues
   - Mitigation: Test both approaches early (Phase 3), choose most stable

2. **React Reconciler API Stability**
   - Impact: High - Core rendering depends on stable API
   - Likelihood: Low - React 19 reconciler is stable
   - Mitigation: Pin React version, abstract reconciler interface

3. **Performance Targets May Not Be Met**
   - Impact: Medium - Performance is a key goal
   - Likelihood: Low - Bun and Effect are designed for performance
   - Mitigation: Benchmark early and often, optimize hot paths

4. **Effect Learning Curve**
   - Impact: Medium - Team may need time to learn Effect patterns
   - Likelihood: Medium - Effect is different from traditional TypeScript
   - Mitigation: Provide Effect pattern examples, code reviews

5. **API Compatibility Edge Cases**
   - Impact: Medium - 100% compatibility required
   - Likelihood: Medium - Edge cases may differ
   - Mitigation: Extensive testing against Ink examples

---

## Rollback Plan

If critical issues discovered during implementation:

1. **Stop development** - Halt work on current phase
2. **Assess impact** - Determine if issue is fixable or fundamental
3. **Fallback options:**
   - Use yoga-layout npm package instead of FFI (if layout issue)
   - Simplify Effect usage (if Effect complexity issue)
   - Fork and modify reconciler (if React issue)
4. **Re-plan if needed** - Adjust implementation plan
5. **Document decision** - Update specs and plan

---

## Timeline Estimate

**Phase 1: Project Setup & Infrastructure** - 3-5 hours
**Phase 2: Core Data Structures** - 8-12 hours
**Phase 3: Yoga Layout Integration** - 9-12 hours
**Phase 4: Effect Services Layer** - 20-25 hours
**Phase 5: React Reconciler Integration** - 8-11 hours
**Phase 6: Renderer Service** - 9-12 hours
**Phase 7: React Components** - 11-14 hours
**Phase 8: React Hooks** - 11-14 hours
**Phase 9: Main API & Render Function** - 6-7 hours
**Phase 10: Utilities & Optimizations** - 7-10 hours
**Phase 11: Testing & Quality Assurance** - 23-29 hours
**Phase 12: Documentation & Examples** - 12-16 hours

**Total: 127-167 hours (16-21 developer days)**

**Recommended approach:** 2 weeks with 2 developers working in parallel where possible

---

## Next Steps

After plan approval:

1. ✅ Review plan with technical leads
2. ✅ Adjust timeline based on team availability
3. ✅ Set up development environment (Phase 1)
4. ✅ Begin Phase 2 (Core Data Structures)
5. Regular progress reviews after each phase
6. Address blockers immediately
7. Update plan if significant deviations occur

---

## Dependencies Summary

**External Dependencies:**
- Bun 1.0+ runtime
- React 19.x
- Effect 3.0+
- @effect/platform (latest)
- @effect/schema (latest)
- yoga-layout OR Bun FFI to Yoga C++
- react-reconciler
- TypeScript 5.x+

**Internal Dependencies (Phase order):**
- Phase 2 → Phase 3 → Phase 4
- Phase 4 → Phase 5 → Phase 6
- Phase 6 → Phase 7 → Phase 8 → Phase 9
- All phases → Phase 11 (testing)
- Phase 11 → Phase 12 (documentation)

**Parallel Opportunities:**
- Phase 7 components can be built in parallel (after reconciler ready)
- Phase 8 hooks can be built in parallel (after contexts ready)
- Phase 10 optimizations can be built alongside testing
- Documentation can start while testing is ongoing

---

## Success Metrics

**Functional Metrics:**
- [ ] All Ink components implemented and working
- [ ] All Ink hooks implemented and working
- [ ] 100% API compatibility verified
- [ ] All example applications run successfully

**Non-Functional Metrics:**
- [ ] Startup time <50ms (50%+ improvement)
- [ ] Memory usage <20MB for basic app (30%+ improvement)
- [ ] Render cycle <16ms for 60fps
- [ ] Layout calculation <5ms
- [ ] Code coverage ≥90%
- [ ] Zero Biome linting errors
- [ ] TypeScript strict mode passes

**Quality Metrics:**
- [ ] 100% API documentation coverage
- [ ] Migration guide complete
- [ ] All examples tested and documented
- [ ] Performance benchmarks in CI
- [ ] Integration tests cover all user stories

---

**Document Version**: 1.0
**Created**: 2025-10-27
**Status**: Ready for Review and Approval
