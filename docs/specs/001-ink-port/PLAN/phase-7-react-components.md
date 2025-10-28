# Phase 7: React Components

**Objective:** Implement all Ink-compatible React components

## 7.1 Text Component

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

## 7.2 Box Component

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

## 7.3 Newline Component

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

## 7.4 Spacer Component

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

## 7.5 Static Component

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

## 7.6 Transform Component

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
