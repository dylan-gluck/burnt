# Phase 4: Effect Services Layer (Foundation)

**Objective:** Implement core Effect services for terminal, output generation, and layout

## 4.1 TerminalService

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

## 4.2 OutputGeneratorService

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

## 4.3 LayoutService

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

## 4.4 InputService

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

## 4.5 FocusManagerService

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
