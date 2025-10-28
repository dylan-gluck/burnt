# Phase 6: Renderer Service (Orchestration)

**Objective:** Implement main renderer service that orchestrates all other services

## 6.1 RendererService Implementation

**Description:** Create renderer service with fiber-based concurrency

**Assigned to:** Backend specialist (Effect patterns)

**Specification reference:** BACKEND_SPEC.md > Section 1.1: RendererService

**Dependencies:** Phase 4 (all services), Phase 5 (reconciler)

**Implementation steps:**
1. Create `src/services/RendererService.ts`
2. Implement RendererServiceImpl with:
   - mount(element) → Effect<RenderTree>
   - render(tree) → Effect<void>
   - unmount() → Effect<void>
   - update(updates) → Effect<RenderTree>
   - waitUntilExit() → Effect<void>
   - renderLoop stream
3. Implement mount logic:
   - Create container
   - Initialize reconciler
   - Start render loop fiber
4. Implement render loop with:
   - Update queue stream
   - Batching within 16ms window
   - Layout calculation
   - Output generation and write
5. Implement processBatchedUpdates with error recovery
6. Add graceful unmount with cleanup
7. Create service using Effect.Service with dependencies
8. Write tests with mock services

**Validation:**
- [ ] All methods from BACKEND_SPEC.md implemented
- [ ] mount() creates and initializes correctly
- [ ] Render loop processes updates in batches
- [ ] Layout and output generation work together
- [ ] Error recovery prevents crashes
- [ ] unmount() cleans up resources
- [ ] Tests verify orchestration logic
- [ ] No fiber leaks or memory leaks

**Estimated effort:** 7-9 hours

## 6.2 Layer Composition

**Description:** Compose all services into application layer

**Assigned to:** Backend specialist (Effect patterns)

**Specification reference:** BACKEND_SPEC.md > Section 2: Layer Composition

**Dependencies:** Task 6.1, Phase 4 (all services)

**Implementation steps:**
1. Create `src/layers/index.ts`
2. Define layer structure:
   - InfrastructureLayer (Terminal, Input, OutputGenerator)
   - LayoutLayer
   - RendererLayer
   - AppLayer (merges all)
3. Implement makeAppLayer(config) for custom config
4. Add AppConfig service
5. Export all layers
6. Write tests for layer composition

**Validation:**
- [ ] Layers compose without circular dependencies
- [ ] Dependencies properly declared
- [ ] AppLayer provides all services
- [ ] Custom config works with makeAppLayer
- [ ] Tests verify layer provision

**Estimated effort:** 2-3 hours

---
