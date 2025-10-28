# Phase 3: Yoga Layout Integration

**Objective:** Integrate Yoga layout engine via FFI or npm package

## 3.1 Yoga Integration Strategy Decision

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

## 3.2 Yoga Engine Implementation

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
