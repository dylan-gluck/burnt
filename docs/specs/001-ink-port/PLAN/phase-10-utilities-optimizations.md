# Phase 10: Utilities & Optimizations

**Objective:** Implement utility functions and Bun-specific optimizations

## 10.1 Text Utilities

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

## 10.2 Bun Buffer Optimizations

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

## 10.3 Performance Fast Paths

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
