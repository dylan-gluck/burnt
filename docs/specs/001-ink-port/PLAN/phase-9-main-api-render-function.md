# Phase 9: Main API & Render Function

**Objective:** Implement main render() function and public API

## 9.1 Render Function

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

## 9.2 Public API Exports

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
