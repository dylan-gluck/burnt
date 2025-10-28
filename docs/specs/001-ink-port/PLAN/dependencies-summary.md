# Dependencies Summary

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
