# Product Requirements Document: Ink Port to Bun and Effect

## Overview

Port the Ink CLI library to a Bun-native implementation leveraging Effect for type-safe error handling, resource management, and dependency injection while maintaining 100% API compatibility with the original Ink library. The implementation must provide a drop-in replacement that leverages Bun's performance characteristics and Effect's composable abstractions.

## Background

### Current State: Ink Library

Ink is a React renderer for building interactive command-line applications using component-based architecture. It uses:
- React reconciliation for component lifecycle
- Yoga layout engine (via yoga-layout npm package) for flexbox-based terminal layouts
- ANTML escape codes for terminal output
- Node.js streams for stdin/stdout/stderr
- Custom reconciler integrated with React

### Target State: Bun + Effect Implementation

Create a native Bun implementation that:
- Uses Bun's native APIs and performance optimizations
- Leverages Effect for resource management, error handling, and dependency injection
- Integrates React 19 features (ref as prop, use(), Actions, etc.)
- Maintains 100% API compatibility with Ink's public interface
- Uses Yoga layout engine via Bun's FFI or native bindings

## Business Goals

1. **Performance**: Leverage Bun's speed for faster CLI application startup and rendering
2. **Type Safety**: Use Effect's typed errors for compile-time error tracking and safer resource management
3. **Developer Experience**: Provide better DX through Effect's composable abstractions and React 19 features
4. **Drop-in Replacement**: Zero migration cost for existing Ink applications
5. **Modern Foundation**: Build on Bun and Effect for long-term maintainability

## Target Audience

- CLI application developers currently using Ink
- TypeScript developers building terminal UIs
- Teams wanting type-safe CLI development with Effect
- Bun ecosystem adopters

## User Stories

### Core Rendering
1. As a developer, I want to render React components to the terminal so I can build UIs with familiar patterns
2. As a developer, I want automatic re-rendering on state changes so my CLI updates reactively
3. As a developer, I want flexbox layout in the terminal so I can build complex layouts easily

### Components
4. As a developer, I want to display styled text with color, bold, italic, etc. so I can create readable output
5. As a developer, I want Box components for layout so I can arrange content with flexbox
6. As a developer, I want Newline, Spacer, Static, and Transform components so I have full layout control

### Input Handling
7. As a developer, I want to capture keyboard input with useInput so I can build interactive CLIs
8. As a developer, I want focus management with useFocus/useFocusManager so I can handle multi-component input

### Stream Access
9. As a developer, I want access to stdin/stdout/stderr streams so I can read/write terminal data
10. As a developer, I want to control the app instance with useApp so I can exit programmatically

### Resource Management
11. As a developer, I want automatic cleanup of terminal state so my CLI doesn't leave artifacts
12. As a developer, I want Effect-based resource management so I can compose cleanup logic safely

### Error Handling
13. As a developer, I want typed errors from Effect so I can handle failures at compile-time
14. As a developer, I want graceful error recovery so my CLI doesn't crash unexpectedly

### React 19 Integration
15. As a developer, I want to use ref as a prop so I don't need forwardRef
16. As a developer, I want to use the use() hook so I can read context conditionally
17. As a developer, I want Context as a provider so I have simpler context usage

## Scope

### In Scope - Must Have (MVP)

#### Core Components (100% API Compatibility)
- **Text**: All props (color, backgroundColor, dimColor, bold, italic, underline, strikethrough, inverse, wrap variants)
- **Box**: All layout props (width, height, margin, padding, flexDirection, justifyContent, alignItems, flex, etc.)
- **Newline**: Line break component
- **Spacer**: Flexible spacing component
- **Static**: Non-updating content component
- **Transform**: Text transformation component

#### Hooks (100% API Compatibility)
- **useInput**: Keyboard input capture with same callback signature
- **useApp**: App instance control (exit method)
- **useStdin**: stdin stream access
- **useStdout**: stdout stream access
- **useStderr**: stderr stream access
- **useFocus**: Keyboard focus state management
- **useFocusManager**: Programmatic focus control

#### Rendering System
- React 19 reconciler integration
- Yoga layout engine integration (via Bun FFI or native bindings)
- ANTML terminal output generation
- Incremental render updates
- Alternative screen buffer support

#### Bun Integration
- Native Bun APIs for file I/O and process management
- Bun FFI for Yoga layout engine (if applicable)
- Bun's performance optimizations (fast startup, low memory)

#### Effect Integration
- Service/Layer pattern for renderer, terminal, input handler
- Effect.gen for async operations
- Typed errors (RenderError, LayoutError, InputError, TerminalError)
- Resource management with automatic cleanup (Scope)
- Dependency injection for testability

#### Type Safety
- Schema validation for component props (Effect Schema)
- Strict TypeScript configuration
- Compile-time error tracking
- Comprehensive type definitions matching Ink's API

### In Scope - Should Have

#### Testing Infrastructure
- Mock layers for renderer, terminal, input
- Effect test runners
- Component testing utilities
- Snapshot testing for output

#### Performance Optimizations
- Render tree diffing optimization
- Layout calculation caching
- Output buffer batching

#### Developer Tools
- Debugging utilities
- Render tree inspection
- Performance profiling

### Out of Scope

#### Not in Initial Release
- Custom renderers beyond terminal
- Browser-based terminal emulation
- Alternative layout engines
- GraphQL/REST API integrations
- Database integrations
- WebSocket support
- File watching utilities

#### Explicitly Excluded
- Breaking changes to Ink's public API
- Non-terminal rendering targets
- Built-in state management (use external libraries)
- CLI framework features (argument parsing, commands) - use external libraries

## Success Criteria

### Functional Requirements
1. All Ink components render identically to original Ink
2. All Ink hooks provide same functionality and API
3. Existing Ink applications run without code changes
4. Yoga layout calculations produce identical results
5. Terminal output matches Ink's visual appearance

### Non-Functional Requirements
1. **Performance**: 50%+ faster startup time vs. Ink on Bun
2. **Performance**: 30%+ lower memory usage during rendering
3. **Type Safety**: Zero runtime type errors in test suite
4. **Code Quality**: 90%+ test coverage
5. **Code Quality**: Zero Biome linting errors
6. **Documentation**: 100% API documentation coverage

### Technical Requirements
1. TypeScript strict mode enabled
2. Effect Schema validation on all public APIs
3. Proper resource cleanup (no leaked file descriptors)
4. Works on macOS, Linux, Windows terminals
5. Compatible with Node.js-based Ink apps via Bun's compatibility layer

## Technical Constraints

### Platform Requirements
- Bun 1.0+ runtime
- React 19+
- Effect 3.0+
- Yoga layout engine (C++20 core, JavaScript bindings)

### Compatibility Requirements
- Must match Ink's public API exactly (components, hooks, props)
- Must support all Ink component prop combinations
- Must handle Ink's expected terminal capabilities (color, cursor control, alternate screen)

### Performance Requirements
- Startup time < 50ms for basic application
- Render cycle < 16ms for smooth 60fps updates
- Layout calculation < 5ms for typical component trees
- Memory usage < 20MB for basic application

### Security Requirements
- No arbitrary code execution from component props
- Safe terminal escape sequence generation
- Proper input validation to prevent injection attacks

## Dependencies

### External Libraries
- **react**: 19.x - Component framework
- **@effect/platform**: Latest - Platform abstractions
- **@effect/schema**: Latest - Validation
- **yoga-layout**: Latest - Flexbox layout engine (or Bun FFI alternative)
- **chalk**: Latest - Terminal color utilities (or native implementation)

### Development Dependencies
- **@types/react**: 19.x
- **@biomejs/biome**: Latest - Linting and formatting
- **vitest**: Latest - Testing (Bun-compatible)
- **@effect/vitest**: Latest - Effect test utilities

### System Dependencies
- Bun runtime (native APIs)
- Terminal with ANTML support
- Yoga layout engine shared library (if using FFI)

## Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     React 19 Application                     │
│  (Components: Text, Box, Newline, Spacer, Static, etc.)    │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    React Reconciler                          │
│   (Fiber tree management, lifecycle, effect scheduling)      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   Render Tree Builder                        │
│        (Convert React elements to render nodes)             │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Yoga Layout Engine                        │
│      (Calculate flexbox layout, positions, dimensions)       │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   Output Generator                           │
│        (Convert layout to ANTML escape sequences)            │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  Terminal Renderer                           │
│    (Write to stdout, manage alternate screen, cleanup)       │
└─────────────────────────────────────────────────────────────┘
```

### Effect Services Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Application Layer                       │
│                   (User's React app code)                    │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Renderer Service                          │
│   (Orchestrates reconciler, layout, output generation)       │
└────────────┬───────────┬────────────┬────────────────────────┘
             │           │            │
             ▼           ▼            ▼
┌──────────────┐  ┌──────────┐  ┌──────────────┐
│   Layout     │  │ Terminal │  │ Input Handler│
│   Service    │  │ Service  │  │   Service    │
└──────────────┘  └──────────┘  └──────────────┘
```

### Data Flow

```
User Code (React Components)
  ↓
React Reconciler (fiber tree updates)
  ↓
Render Tree Builder (Effect service)
  ↓
Layout Service (Yoga calculations via Effect)
  ↓
Output Generator (ANTML generation)
  ↓
Terminal Service (Effect platform streams)
  ↓
Terminal Display
```

## Implementation Phases

### Phase 1: Core Rendering Infrastructure
- React reconciler setup
- Render tree data structures
- Basic Text and Box components
- Terminal service with Effect platform

### Phase 2: Layout Engine Integration
- Yoga layout engine bindings (Bun FFI or npm package)
- Layout calculation service
- Flexbox property mapping

### Phase 3: Component API Completion
- All component props implementation
- Newline, Spacer, Static, Transform components
- Component validation schemas

### Phase 4: Hooks Implementation
- useInput with keyboard capture
- useStdin/useStdout/useStderr stream hooks
- useFocus/useFocusManager focus management
- useApp instance control

### Phase 5: Terminal Features
- ANTML output generation
- Color and styling
- Cursor control
- Alternate screen buffer
- Terminal resize handling

### Phase 6: Testing and Optimization
- Component test suite
- Mock layers for testing
- Performance benchmarking
- Memory optimization

## Risks and Mitigations

### Risk: Yoga Layout Engine Integration with Bun
**Impact**: High - Core layout functionality depends on it
**Likelihood**: Medium - Bun FFI may have compatibility issues
**Mitigation**: Test both Bun FFI and npm package approaches; fallback to npm package if FFI is problematic

### Risk: React Reconciler API Changes
**Impact**: High - Core rendering depends on stable reconciler API
**Likelihood**: Low - React reconciler API is relatively stable
**Mitigation**: Pin React version; abstract reconciler interface for easier updates

### Risk: Terminal Compatibility Issues
**Impact**: Medium - Some terminals may not support all features
**Likelihood**: Medium - Terminal capabilities vary
**Mitigation**: Feature detection; graceful degradation; comprehensive terminal testing

### Risk: Performance Overhead from Effect
**Impact**: Medium - Effect abstractions may add overhead
**Likelihood**: Low - Effect is designed for performance
**Mitigation**: Benchmark critical paths; optimize hot paths; use Effect best practices

### Risk: API Breaking Changes from Ink Updates
**Impact**: Low - We match current Ink API
**Likelihood**: Medium - Ink may evolve
**Mitigation**: Version pinning; clear versioning strategy; monitor Ink releases

## Open Questions

1. **Yoga Integration**: Should we use Bun FFI for direct C++ bindings or use the yoga-layout npm package?
   - FFI: Better performance, more complexity
   - npm package: Easier integration, proven compatibility

2. **React Reconciler**: Should we fork react-reconciler or use it as-is?
   - Fork: More control, can optimize for Bun
   - As-is: Less maintenance, easier updates

3. **Terminal Detection**: How should we detect terminal capabilities?
   - Environment variables (TERM, COLORTERM)
   - Terminal query sequences
   - Configuration options

4. **Error Reporting**: How should we surface Effect errors to users?
   - Console errors with stack traces
   - Custom error reporter service
   - User-configurable error handlers

5. **Streaming Output**: Should we buffer output or stream directly?
   - Buffer: Reduces flicker, batches writes
   - Stream: Lower latency, simpler

## Appendix

### Ink API Reference (Public Interface to Match)

#### Components
```typescript
// Text component
<Text color="green" backgroundColor="white" bold italic underline>
  Hello World
</Text>

// Box component
<Box width={20} height={10} padding={1} flexDirection="column">
  <Text>Content</Text>
</Box>

// Newline, Spacer, Static, Transform
<Newline />
<Spacer />
<Static items={data}>{(item) => <Text>{item}</Text>}</Static>
<Transform transform={(text) => text.toUpperCase()}>
  <Text>hello</Text>
</Transform>
```

#### Hooks
```typescript
useInput((input, key) => {
  // Handle input
});

const { exit } = useApp();
const { stdin } = useStdin();
const { stdout } = useStdout();
const { stderr } = useStderr();

const { isFocused } = useFocus();
const { focus, focusNext, focusPrevious } = useFocusManager();
```

### Yoga Layout Properties Mapping

Flexbox properties used by Ink:
- width, height, minWidth, minHeight, maxWidth, maxHeight
- margin, marginLeft, marginRight, marginTop, marginBottom
- padding, paddingLeft, paddingRight, paddingTop, paddingBottom
- flexDirection (row, column, row-reverse, column-reverse)
- justifyContent (flex-start, flex-end, center, space-between, space-around)
- alignItems (flex-start, flex-end, center, stretch)
- alignSelf (auto, flex-start, flex-end, center, stretch)
- flexGrow, flexShrink, flexBasis
- position (relative, absolute)
- top, right, bottom, left

### Terminal Capabilities Required

- ANTML escape sequence support (colors, styling, cursor control)
- Alternate screen buffer (for full-screen apps)
- Raw mode (for input capture)
- Terminal resize detection (SIGWINCH on Unix)
- UTF-8 support for Unicode characters

### Effect Services Structure

```
AppLayer
  ├─ RendererLayer
  │    ├─ ReconcilerService
  │    ├─ RenderTreeService
  │    └─ OutputGeneratorService
  ├─ LayoutLayer
  │    └─ YogaLayoutService
  ├─ TerminalLayer
  │    ├─ StdoutService
  │    ├─ StdinService
  │    └─ StderrService
  └─ InputLayer
       └─ KeyboardInputService
```

---

**Document Version**: 1.0
**Created**: 2025-10-27
**Status**: Draft
