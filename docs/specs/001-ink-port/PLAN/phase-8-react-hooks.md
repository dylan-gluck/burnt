# Phase 8: React Hooks

**Objective:** Implement all Ink-compatible React hooks

## 8.1 Context Providers

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

## 8.2 useInput Hook

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

## 8.3 useApp Hook

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

## 8.4 Stream Hooks (useStdin, useStdout, useStderr)

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

## 8.5 Focus Hooks (useFocus, useFocusManager)

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
