# Phase 2: Core Data Structures

**Objective:** Implement render tree nodes, layout types, and Effect schemas

## 2.1 Render Node Types

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

## 2.2 Layout and Terminal Types

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

## 2.3 Effect Schemas

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

## 2.4 Error Types

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
