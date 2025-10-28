# Rollback Plan

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
