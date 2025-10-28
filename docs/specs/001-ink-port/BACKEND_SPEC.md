# Backend Specification: Ink Port to Bun and Effect

## Overview

This document specifies the backend implementation for the Ink port using Bun and Effect. It defines services, layers, business logic, resource management, and integration with the Yoga layout engine and terminal I/O. All implementations leverage Effect's fiber-based concurrency, typed error handling, and dependency injection patterns.

---

## 1. Service Definitions

### 1.1 RendererService

**Purpose**: Orchestrates React reconciliation, layout calculation, and output rendering using fiber-based concurrency.

**Location**: `src/services/RendererService.ts`

```typescript
import { Effect, Context, Layer, Fiber, Queue, Ref, Scope } from "effect"
import type { ReactElement } from "react"

// Typed errors
export class RenderError extends Data.TaggedError("RenderError")<{
  message: string
  cause?: unknown
  nodeId?: string
}> {}

export class MountError extends Data.TaggedError("MountError")<{
  message: string
  cause?: unknown
}> {}

interface RendererService {
  // Core rendering operations with typed errors
  render: (tree: RenderTree) => Effect.Effect<void, RenderError>
  mount: (element: ReactElement) => Effect.Effect<RenderTree, MountError>
  unmount: () => Effect.Effect<void, RenderError>
  update: (updates: Update[]) => Effect.Effect<RenderTree, RenderError>

  // Lifecycle management
  waitUntilExit: () => Effect.Effect<void, never>

  // Streams for continuous rendering
  renderLoop: Stream.Stream<RenderResult, RenderError>
}

// Implementation with Effect patterns
class RendererServiceImpl implements RendererService {
  constructor(
    private layout: LayoutService,
    private outputGenerator: OutputGeneratorService,
    private terminal: TerminalService,
    private reconciler: ReactReconciler,
    private updateQueue: Queue.Queue<Update>,
    private renderFiber: Ref.Ref<Option.Option<Fiber.RuntimeFiber<never, RenderError>>>
  ) {}

  mount(element: ReactElement): Effect.Effect<RenderTree, MountError> {
    return Effect.gen(function* () {
      // 1. Create root container with scoped resource management
      const tree = yield* Effect.acquireRelease(
        Effect.sync(() => createRenderTree()),
        (tree) => Effect.sync(() => cleanupTree(tree))
      )

      // 2. Initialize React reconciler
      const container = yield* Effect.try({
        try: () => this.reconciler.createContainer(tree),
        catch: (error) => new MountError({
          message: "Failed to create container",
          cause: error
        })
      })

      // 3. Render element into container
      yield* Effect.try({
        try: () => this.reconciler.updateContainer(element, container),
        catch: (error) => new MountError({
          message: "Failed to render element",
          cause: error
        })
      })

      // 4. Start render loop in background fiber
      const renderFiber = yield* Effect.fork(this.startRenderLoop(tree))
      yield* Ref.set(this.renderFiber, Option.some(renderFiber))

      return tree
    }).pipe(
      Effect.withSpan("RendererService.mount"),
      Effect.annotateLogs("service", "renderer")
    )
  }

  // Concurrent render loop using fibers and streams
  private startRenderLoop(tree: RenderTree): Effect.Effect<never, RenderError> {
    return Effect.gen(function* () {
      // Create stream from update queue
      const updateStream = Stream.fromQueue(this.updateQueue)

      // Process updates with concurrency control
      yield* updateStream.pipe(
        Stream.tap((update) => Effect.logDebug(`Processing update: ${update.type}`)),
        // Batch updates within 16ms window (60fps)
        Stream.groupedWithin(100, "16 millis"),
        Stream.mapEffect((updates) =>
          this.processBatchedUpdates(tree, updates),
          { concurrency: 1 } // Sequential rendering
        ),
        Stream.runDrain
      )
    })
  }

  private processBatchedUpdates(
    tree: RenderTree,
    updates: Chunk.Chunk<Update>
  ): Effect.Effect<void, RenderError> {
    return Effect.gen(function* () {
      // 1. Apply all updates to tree
      for (const update of updates) {
        yield* this.applyUpdate(tree, update)
      }

      // 2. Trigger layout recalculation
      const layoutResult = yield* this.layout.calculate({
        root: tree.root,
        terminalSize: yield* this.terminal.getSize()
      })

      // 3. Generate and render output
      yield* this.renderToTerminal(layoutResult)
    }).pipe(
      Effect.catchAllCause((cause) =>
        Effect.gen(function* () {
          yield* Effect.logError("Render batch failed", cause)
          // Continue rendering despite errors
          return Effect.void
        })
      )
    )
  }

  render(tree: RenderTree): Effect.Effect<void, RenderError> {
    return Effect.gen(function* () {
      // 1. Check if layout needed
      if (!tree.needsLayout) {
        return
      }

      // 2. Calculate layout with error recovery
      const layoutResult = yield* this.layout.calculate({
        root: tree.root,
        terminalSize: yield* this.terminal.getSize()
      }).pipe(
        Effect.retry(Schedule.exponential("100 millis").pipe(
          Schedule.compose(Schedule.recurs(3))
        )),
        Effect.catchTag("LayoutError", (error) =>
          Effect.gen(function* () {
            yield* Effect.logWarning("Layout failed, using cached result", error)
            return tree.previousLayout ?? defaultLayout
          })
        )
      )

      // 3. Generate output buffer
      const buffer = yield* this.outputGenerator.generate(tree)

      // 4. Diff with previous buffer
      const diff = yield* this.outputGenerator.diff(
        tree.previousBuffer ?? emptyBuffer,
        buffer
      )

      // 5. Convert diff to ANTML and write to terminal
      const antml = yield* this.outputGenerator.toANTML(diff)
      yield* this.terminal.write(antml)

      // 6. Update cache
      tree.previousBuffer = buffer
      tree.previousLayout = layoutResult
      tree.needsLayout = false
    }).pipe(
      Effect.withSpan("RendererService.render"),
      Effect.annotateLogs({ nodeCount: tree.nodeCount })
    )
  }

  unmount(): Effect.Effect<void, RenderError> {
    return Effect.gen(function* () {
      // 1. Interrupt render fiber
      const fiberRef = yield* Ref.get(this.renderFiber)
      if (Option.isSome(fiberRef)) {
        yield* Fiber.interrupt(fiberRef.value)
      }

      // 2. Clean up reconciler
      yield* Effect.sync(() => this.reconciler.clear())

      // 3. Restore terminal state (handled by Scope)
      yield* this.terminal.exitAlternateScreen()
      yield* this.terminal.showCursor()
    }).pipe(
      Effect.ensuring(
        Effect.log("Renderer unmounted successfully")
      )
    )
  }

  waitUntilExit(): Effect.Effect<void, never> {
    return Effect.gen(function* () {
      const deferred = yield* Deferred.make<void, never>()

      // Register exit handler
      process.on('SIGINT', () => {
        Effect.runSync(Deferred.succeed(deferred, undefined))
      })

      yield* Deferred.await(deferred)
    })
  }
}

// Service tag with Effect.Service pattern
export class RendererService extends Effect.Service<RendererService>()(
  "app/RendererService",
  {
    effect: Effect.gen(function* () {
      const layout = yield* LayoutService
      const outputGenerator = yield* OutputGeneratorService
      const terminal = yield* TerminalService
      const reconciler = yield* createReconciler()
      const updateQueue = yield* Queue.unbounded<Update>()
      const renderFiber = yield* Ref.make(Option.none<Fiber.RuntimeFiber<never, RenderError>>())

      return new RendererServiceImpl(
        layout,
        outputGenerator,
        terminal,
        reconciler,
        updateQueue,
        renderFiber
      )
    }),
    dependencies: [
      LayoutService.Default,
      OutputGeneratorService.Default,
      TerminalService.Default
    ]
  }
) {}
```

### 1.2 LayoutService

**Purpose**: Manages Yoga layout engine with Effect's resource management and caching.

**Location**: `src/services/LayoutService.ts`

```typescript
import { Effect, Context, Layer, Cache, Duration } from "effect"

export class LayoutError extends Data.TaggedError("LayoutError")<{
  message: string
  cause?: unknown
  nodeId?: string
}> {}

interface LayoutService {
  calculate: (request: LayoutRequest) => Effect.Effect<LayoutResult, LayoutError>
  createYogaNode: (renderNode: RenderNode) => Effect.Effect<YogaNode, LayoutError>
  destroyYogaNode: (yogaNode: YogaNode) => Effect.Effect<void, LayoutError>
  applyStyles: (yogaNode: YogaNode, props: BoxProps) => Effect.Effect<void, LayoutError>
}

class LayoutServiceImpl implements LayoutService {
  constructor(
    private yogaEngine: YogaEngine,
    private layoutCache: Cache.Cache<string, LayoutResult, LayoutError>
  ) {}

  calculate(request: LayoutRequest): Effect.Effect<LayoutResult, LayoutError> {
    return Effect.gen(function* () {
      // Use cache for layout results with TTL
      const cacheKey = this.generateCacheKey(request)

      return yield* Cache.get(
        this.layoutCache,
        cacheKey,
        () => this.performLayout(request)
      )
    }).pipe(
      Effect.withSpan("LayoutService.calculate"),
      Effect.annotateLogs({
        nodeId: request.root.id,
        width: request.terminalSize.width,
        height: request.terminalSize.height
      })
    )
  }

  private performLayout(request: LayoutRequest): Effect.Effect<LayoutResult, LayoutError> {
    return Effect.gen(function* () {
      // 1. Get root Yoga node
      const rootYogaNode = request.root.yogaNode

      // 2. Set available width/height
      yield* Effect.try({
        try: () => {
          this.yogaEngine.setWidth(rootYogaNode, request.terminalSize.width)
          this.yogaEngine.setHeight(rootYogaNode, request.terminalSize.height)
        },
        catch: (error) => new LayoutError({
          message: "Failed to set dimensions",
          cause: error,
          nodeId: request.root.id
        })
      })

      // 3. Calculate layout
      yield* Effect.try({
        try: () => this.yogaEngine.calculateLayout(
          rootYogaNode,
          request.terminalSize.width,
          request.terminalSize.height
        ),
        catch: (error) => new LayoutError({
          message: "Layout calculation failed",
          cause: error,
          nodeId: request.root.id
        })
      })

      // 4. Traverse tree and extract computed values
      const updates = yield* this.extractLayoutInfo(request.root)

      // 5. Update RenderNode.layoutInfo for each node
      yield* Effect.forEach(updates, ({ node, layout }) =>
        Effect.sync(() => {
          node.layoutInfo = layout
          node.needsLayout = false
        }),
        { concurrency: "unbounded" }
      )

      return {
        root: request.root,
        timestamp: Date.now()
      }
    })
  }

  createYogaNode(renderNode: RenderNode): Effect.Effect<YogaNode, LayoutError> {
    return Effect.acquireRelease(
      Effect.try({
        try: () => this.yogaEngine.createNode(),
        catch: (error) => new LayoutError({
          message: "Failed to create Yoga node",
          cause: error,
          nodeId: renderNode.id
        })
      }),
      (node) => this.destroyYogaNode(node)
    )
  }

  destroyYogaNode(yogaNode: YogaNode): Effect.Effect<void, LayoutError> {
    return Effect.try({
      try: () => this.yogaEngine.destroyNode(yogaNode),
      catch: (error) => new LayoutError({
        message: "Failed to destroy Yoga node",
        cause: error
      })
    })
  }

  applyStyles(yogaNode: YogaNode, props: BoxProps): Effect.Effect<void, LayoutError> {
    return Effect.gen(function* () {
      yield* Effect.try({
        try: () => {
          // Map BoxProps to Yoga properties
          if (props.width !== undefined) {
            this.yogaEngine.setWidth(yogaNode, props.width)
          }
          if (props.height !== undefined) {
            this.yogaEngine.setHeight(yogaNode, props.height)
          }
          if (props.margin !== undefined) {
            this.yogaEngine.setMargin(yogaNode, "all", props.margin)
          }
          if (props.padding !== undefined) {
            this.yogaEngine.setPadding(yogaNode, "all", props.padding)
          }
          if (props.flexDirection !== undefined) {
            this.yogaEngine.setFlexDirection(yogaNode, props.flexDirection)
          }
        },
        catch: (error) => new LayoutError({
          message: "Failed to apply styles",
          cause: error
        })
      })
    })
  }

  private extractLayoutInfo(node: RenderNode): Effect.Effect<Array<{ node: RenderNode, layout: LayoutInfo }>, LayoutError> {
    return Effect.gen(function* () {
      const results: Array<{ node: RenderNode, layout: LayoutInfo }> = []

      const traverse = (current: RenderNode): Effect.Effect<void, LayoutError> =>
        Effect.gen(function* () {
          if (current.yogaNode) {
            const computed = yield* Effect.try({
              try: () => this.yogaEngine.getComputedLayout(current.yogaNode!),
              catch: (error) => new LayoutError({
                message: "Failed to get computed layout",
                cause: error,
                nodeId: current.id
              })
            })

            results.push({
              node: current,
              layout: {
                x: computed.left,
                y: computed.top,
                width: computed.width,
                height: computed.height
              }
            })
          }

          // Process children in parallel
          yield* Effect.forEach(
            current.children,
            (child) => traverse(child),
            { concurrency: "unbounded" }
          )
        })

      yield* traverse(node)
      return results
    })
  }

  private generateCacheKey(request: LayoutRequest): string {
    // Generate cache key based on node structure and terminal size
    return `${request.root.id}-${request.terminalSize.width}x${request.terminalSize.height}`
  }
}

// Service definition with caching layer
export class LayoutService extends Effect.Service<LayoutService>()(
  "app/LayoutService",
  {
    scoped: Effect.gen(function* () {
      const yogaEngine = yield* createYogaEngine()

      // Create cache with TTL and size limits
      const layoutCache = yield* Cache.make({
        capacity: 100,
        timeToLive: Duration.millis(100), // Cache for 100ms
        lookup: (key: string) =>
          Effect.fail(new LayoutError({ message: "Cache miss" }))
      })

      return new LayoutServiceImpl(yogaEngine, layoutCache)
    }),
    dependencies: []
  }
) {}
```

### 1.3 TerminalService

**Purpose**: Manages terminal I/O with streams for resize events and async writes.

**Location**: `src/services/TerminalService.ts`

```typescript
import { Effect, Context, Layer, Stream, Queue, Ref } from "effect"
import type { Writable, Readable } from "stream"

export class TerminalError extends Data.TaggedError("TerminalError")<{
  message: string
  cause?: unknown
}> {}

interface TerminalService {
  write: (output: ANTMLOutput) => Effect.Effect<void, TerminalError>
  clear: () => Effect.Effect<void, TerminalError>
  enterAlternateScreen: () => Effect.Effect<void, TerminalError>
  exitAlternateScreen: () => Effect.Effect<void, TerminalError>
  showCursor: () => Effect.Effect<void, TerminalError>
  hideCursor: () => Effect.Effect<void, TerminalError>
  getSize: () => Effect.Effect<TerminalSize, TerminalError>

  // Stream of terminal resize events
  onResize: () => Stream.Stream<TerminalSize, TerminalError>
}

class TerminalServiceImpl implements TerminalService {
  constructor(
    private stdout: Writable,
    private stdin: Readable,
    private writeQueue: Queue.Queue<ANTMLOutput>,
    private resizeQueue: Queue.Queue<TerminalSize>
  ) {}

  write(output: ANTMLOutput): Effect.Effect<void, TerminalError> {
    // Queue writes for batching
    return Queue.offer(this.writeQueue, output).pipe(
      Effect.asVoid,
      Effect.catchAll((error) =>
        Effect.fail(new TerminalError({
          message: "Failed to queue write",
          cause: error
        }))
      )
    )
  }

  // Start background fiber to process write queue
  private startWriteLoop(): Effect.Effect<never, TerminalError> {
    return Effect.gen(function* () {
      const writeStream = Stream.fromQueue(this.writeQueue)

      yield* writeStream.pipe(
        // Batch writes within 16ms window
        Stream.groupedWithin(50, "16 millis"),
        Stream.mapEffect((outputs) => this.flushWrites(outputs)),
        Stream.runDrain
      )
    })
  }

  private flushWrites(outputs: Chunk.Chunk<ANTMLOutput>): Effect.Effect<void, TerminalError> {
    return Effect.gen(function* () {
      const combined = outputs.pipe(
        Chunk.map(output => output.content),
        Chunk.join("")
      )

      yield* Effect.async<void, TerminalError>((resume) => {
        this.stdout.write(combined, (error) => {
          if (error) {
            resume(Effect.fail(new TerminalError({
              message: "Write failed",
              cause: error
            })))
          } else {
            resume(Effect.void)
          }
        })
      })
    })
  }

  enterAlternateScreen(): Effect.Effect<void, TerminalError> {
    return Effect.gen(function* () {
      yield* this.write({ content: "\x1b[?1049h" })
      yield* this.clear()
      yield* this.hideCursor()
    })
  }

  exitAlternateScreen(): Effect.Effect<void, TerminalError> {
    return Effect.gen(function* () {
      yield* this.showCursor()
      yield* this.write({ content: "\x1b[?1049l" })
    })
  }

  getSize(): Effect.Effect<TerminalSize, TerminalError> {
    return Effect.try({
      try: () => ({
        width: this.stdout.columns ?? 80,
        height: this.stdout.rows ?? 24
      }),
      catch: (error) => new TerminalError({
        message: "Failed to get terminal size",
        cause: error
      })
    })
  }

  onResize(): Stream.Stream<TerminalSize, TerminalError> {
    return Stream.fromQueue(this.resizeQueue).pipe(
      Stream.tap((size) => Effect.logDebug(`Terminal resized: ${size.width}x${size.height}`))
    )
  }

  hideCursor(): Effect.Effect<void, TerminalError> {
    return this.write({ content: "\x1b[?25l" })
  }

  showCursor(): Effect.Effect<void, TerminalError> {
    return this.write({ content: "\x1b[?25h" })
  }

  clear(): Effect.Effect<void, TerminalError> {
    return this.write({ content: "\x1b[2J\x1b[H" })
  }
}

// Service with scoped lifecycle
export class TerminalService extends Effect.Service<TerminalService>()(
  "app/TerminalService",
  {
    scoped: Effect.gen(function* () {
      const config = yield* AppConfig
      const writeQueue = yield* Queue.unbounded<ANTMLOutput>()
      const resizeQueue = yield* Queue.unbounded<TerminalSize>()

      const service = new TerminalServiceImpl(
        config.stdout,
        config.stdin,
        writeQueue,
        resizeQueue
      )

      // Set up resize listener
      yield* Effect.acquireRelease(
        Effect.sync(() => {
          const handler = () => {
            Effect.runSync(
              Effect.gen(function* () {
                const size = yield* service.getSize()
                yield* Queue.offer(resizeQueue, size)
              })
            )
          }
          process.on('SIGWINCH', handler)
          return handler
        }),
        (handler) => Effect.sync(() => {
          process.off('SIGWINCH', handler)
        })
      )

      // Start write loop fiber
      yield* Effect.forkScoped(service.startWriteLoop())

      // Enter alternate screen and hide cursor
      yield* service.enterAlternateScreen()

      // Add finalizer to restore terminal
      yield* Effect.addFinalizer(() =>
        service.exitAlternateScreen().pipe(
          Effect.catchAll(() => Effect.void)
        )
      )

      return service
    }),
    dependencies: []
  }
) {}
```

### 1.4 InputService

**Purpose**: Captures keyboard/mouse input as a stream with proper resource cleanup.

**Location**: `src/services/InputService.ts`

```typescript
import { Effect, Context, Layer, Stream, Queue, Scope } from "effect"

export class InputError extends Data.TaggedError("InputError")<{
  message: string
  cause?: unknown
}> {}

interface InputService {
  // Stream of input events
  inputStream: Stream.Stream<InputEvent, InputError>

  // Control methods
  startCapture: () => Effect.Effect<void, InputError>
  stopCapture: () => Effect.Effect<void, InputError>
  setRawMode: (enabled: boolean) => Effect.Effect<void, InputError>
}

class InputServiceImpl implements InputService {
  private inputQueue: Queue.Queue<InputEvent>

  constructor(
    private stdin: Readable,
    private exitOnCtrlC: boolean,
    inputQueue: Queue.Queue<InputEvent>
  ) {
    this.inputQueue = inputQueue
  }

  get inputStream(): Stream.Stream<InputEvent, InputError> {
    return Stream.fromQueue(this.inputQueue).pipe(
      Stream.tap((event) => {
        // Handle Ctrl+C if exitOnCtrlC is enabled
        if (this.exitOnCtrlC && event.key === 'c' && event.ctrl) {
          return Effect.sync(() => process.exit(0))
        }
        return Effect.void
      }),
      Stream.mapError((error) => new InputError({
        message: "Input stream error",
        cause: error
      }))
    )
  }

  setRawMode(enabled: boolean): Effect.Effect<void, InputError> {
    return Effect.try({
      try: () => {
        if ('setRawMode' in this.stdin && typeof this.stdin.setRawMode === 'function') {
          this.stdin.setRawMode(enabled)
        }
      },
      catch: (error) => new InputError({
        message: "Failed to set raw mode",
        cause: error
      })
    })
  }

  startCapture(): Effect.Effect<void, InputError> {
    return Effect.gen(function* () {
      yield* this.setRawMode(true)

      yield* Effect.sync(() => {
        this.stdin.setEncoding('utf8')
        this.stdin.resume()

        this.stdin.on('data', (data: Buffer) => {
          const events = this.parseInput(data)
          Effect.runSync(
            Effect.forEach(events, (event) =>
              Queue.offer(this.inputQueue, event),
              { discard: true }
            )
          )
        })
      })
    })
  }

  stopCapture(): Effect.Effect<void, InputError> {
    return Effect.gen(function* () {
      yield* Effect.sync(() => {
        this.stdin.removeAllListeners('data')
        this.stdin.pause()
      })

      yield* this.setRawMode(false)
    })
  }

  private parseInput(data: Buffer): Array<InputEvent> {
    // Parse raw input into InputEvent objects
    const str = data.toString('utf8')
    const events: Array<InputEvent> = []

    // Detect special keys and control sequences
    if (str === '\x1b[A') events.push({ type: 'key', key: 'up' })
    else if (str === '\x1b[B') events.push({ type: 'key', key: 'down' })
    else if (str === '\x1b[C') events.push({ type: 'key', key: 'right' })
    else if (str === '\x1b[D') events.push({ type: 'key', key: 'left' })
    else if (str === '\r') events.push({ type: 'key', key: 'return' })
    else if (str === '\x03') events.push({ type: 'key', key: 'c', ctrl: true })
    else {
      for (const char of str) {
        events.push({ type: 'key', key: char })
      }
    }

    return events
  }
}

// Service with scoped input capture
export class InputService extends Effect.Service<InputService>()(
  "app/InputService",
  {
    scoped: Effect.gen(function* () {
      const config = yield* AppConfig
      const inputQueue = yield* Queue.unbounded<InputEvent>()

      const service = new InputServiceImpl(
        config.stdin,
        config.exitOnCtrlC ?? true,
        inputQueue
      )

      // Start capture with automatic cleanup
      yield* Effect.acquireRelease(
        service.startCapture(),
        () => service.stopCapture().pipe(
          Effect.catchAll(() => Effect.void)
        )
      )

      return service
    }),
    dependencies: []
  }
) {}
```

### 1.5 OutputGeneratorService

**Purpose**: Converts render tree to terminal output with parallel processing.

**Location**: `src/services/OutputGeneratorService.ts`

```typescript
import { Effect, Context, Layer } from "effect"

export class OutputError extends Data.TaggedError("OutputError")<{
  message: string
  cause?: unknown
  nodeId?: string
}> {}

interface OutputGeneratorService {
  generate: (tree: RenderTree) => Effect.Effect<OutputBuffer, OutputError>
  diff: (previous: OutputBuffer, current: OutputBuffer) => Effect.Effect<OutputDiff, OutputError>
  toANTML: (diff: OutputDiff) => Effect.Effect<ANTMLOutput, OutputError>
}

class OutputGeneratorServiceImpl implements OutputGeneratorService {
  generate(tree: RenderTree): Effect.Effect<OutputBuffer, OutputError> {
    return Effect.gen(function* () {
      const buffer: OutputBuffer = {
        lines: [],
        width: 0,
        height: 0
      }

      // Traverse tree and build buffer
      yield* this.traverseAndRender(tree.root, buffer)

      return buffer
    }).pipe(
      Effect.withSpan("OutputGenerator.generate"),
      Effect.annotateLogs({ nodeId: tree.root.id })
    )
  }

  private traverseAndRender(
    node: RenderNode,
    buffer: OutputBuffer
  ): Effect.Effect<void, OutputError> {
    return Effect.gen(function* () {
      if (node.type === 'text' && node.textContent) {
        yield* this.renderTextNode(node, buffer)
      } else if (node.type === 'box') {
        yield* this.renderBoxNode(node, buffer)
      }

      // Process children in parallel
      yield* Effect.forEach(
        node.children,
        (child) => this.traverseAndRender(child, buffer),
        { concurrency: "unbounded" }
      )
    })
  }

  private renderTextNode(
    node: RenderNode,
    buffer: OutputBuffer
  ): Effect.Effect<void, OutputError> {
    return Effect.sync(() => {
      if (!node.layoutInfo || !node.textContent) return

      const { x, y } = node.layoutInfo
      const styledText = this.applyTextStyles(node.textContent, node.style)

      // Ensure line exists
      while (buffer.lines.length <= y) {
        buffer.lines.push([])
      }

      // Write text at position
      buffer.lines[y][x] = styledText
    })
  }

  private renderBoxNode(
    node: RenderNode,
    buffer: OutputBuffer
  ): Effect.Effect<void, OutputError> {
    return Effect.sync(() => {
      if (!node.layoutInfo) return

      const { x, y, width, height } = node.layoutInfo

      // Render border if specified
      if (node.props?.borderStyle) {
        this.renderBorder(buffer, x, y, width, height, node.props.borderStyle)
      }
    })
  }

  diff(previous: OutputBuffer, current: OutputBuffer): Effect.Effect<OutputDiff, OutputError> {
    return Effect.gen(function* () {
      const operations: Array<OutputOperation> = []

      // Compare line by line
      const maxLines = Math.max(previous.lines.length, current.lines.length)

      for (let y = 0; y < maxLines; y++) {
        const prevLine = previous.lines[y] ?? []
        const currLine = current.lines[y] ?? []

        const lineOps = this.diffLine(prevLine, currLine, y)
        operations.push(...lineOps)
      }

      // Optimize consecutive operations
      const optimized = this.optimizeOperations(operations)

      return { operations: optimized }
    })
  }

  private diffLine(
    prev: Array<string>,
    curr: Array<string>,
    y: number
  ): Array<OutputOperation> {
    const operations: Array<OutputOperation> = []
    const maxX = Math.max(prev.length, curr.length)

    for (let x = 0; x < maxX; x++) {
      if (prev[x] !== curr[x]) {
        operations.push({
          type: 'write',
          x,
          y,
          content: curr[x] ?? ' '
        })
      }
    }

    return operations
  }

  private optimizeOperations(operations: Array<OutputOperation>): Array<OutputOperation> {
    // Merge consecutive writes on same line
    const optimized: Array<OutputOperation> = []
    let current: OutputOperation | null = null

    for (const op of operations) {
      if (current &&
          current.type === 'write' &&
          op.type === 'write' &&
          current.y === op.y &&
          current.x + current.content.length === op.x) {
        // Merge with previous write
        current.content += op.content
      } else {
        if (current) optimized.push(current)
        current = op
      }
    }

    if (current) optimized.push(current)
    return optimized
  }

  toANTML(diff: OutputDiff): Effect.Effect<ANTMLOutput, OutputError> {
    return Effect.sync(() => {
      let antml = ''

      for (const op of diff.operations) {
        if (op.type === 'write') {
          // Move cursor and write
          antml += `\x1b[${op.y + 1};${op.x + 1}H`
          antml += op.content
        } else if (op.type === 'clear') {
          antml += '\x1b[2J'
        }
      }

      return { content: antml }
    })
  }

  private applyTextStyles(text: string, style?: TextStyle): string {
    if (!style) return text

    let result = '\x1b[0m' // Reset

    if (style.foreground) {
      const { r, g, b } = style.foreground
      result += `\x1b[38;2;${r};${g};${b}m`
    }

    if (style.background) {
      const { r, g, b } = style.background
      result += `\x1b[48;2;${r};${g};${b}m`
    }

    if (style.bold) result += '\x1b[1m'
    if (style.italic) result += '\x1b[3m'
    if (style.underline) result += '\x1b[4m'

    result += text
    result += '\x1b[0m' // Reset

    return result
  }

  private renderBorder(
    buffer: OutputBuffer,
    x: number,
    y: number,
    width: number,
    height: number,
    style: BorderStyle
  ): void {
    const chars = this.getBorderChars(style)

    // Top border
    buffer.lines[y][x] = chars.topLeft
    for (let i = 1; i < width - 1; i++) {
      buffer.lines[y][x + i] = chars.horizontal
    }
    buffer.lines[y][x + width - 1] = chars.topRight

    // Sides
    for (let i = 1; i < height - 1; i++) {
      buffer.lines[y + i][x] = chars.vertical
      buffer.lines[y + i][x + width - 1] = chars.vertical
    }

    // Bottom border
    buffer.lines[y + height - 1][x] = chars.bottomLeft
    for (let i = 1; i < width - 1; i++) {
      buffer.lines[y + height - 1][x + i] = chars.horizontal
    }
    buffer.lines[y + height - 1][x + width - 1] = chars.bottomRight
  }

  private getBorderChars(style: BorderStyle) {
    if (style === 'single') {
      return {
        topLeft: '┌',
        topRight: '┐',
        bottomLeft: '└',
        bottomRight: '┘',
        horizontal: '─',
        vertical: '│'
      }
    }
    // Add more border styles as needed
    return {
      topLeft: '+',
      topRight: '+',
      bottomLeft: '+',
      bottomRight: '+',
      horizontal: '-',
      vertical: '|'
    }
  }
}

// Simple service without dependencies
export class OutputGeneratorService extends Effect.Service<OutputGeneratorService>()(
  "app/OutputGeneratorService",
  {
    succeed: new OutputGeneratorServiceImpl()
  }
) {}
```

### 1.6 FocusManagerService

**Purpose**: Manages keyboard focus state using Ref for concurrent updates.

**Location**: `src/services/FocusManagerService.ts`

```typescript
import { Effect, Context, Layer, Ref, SubscriptionRef } from "effect"

interface FocusManagerService {
  // Reactive focus state
  focusState: SubscriptionRef.SubscriptionRef<FocusState>

  // Operations
  focus: (nodeId: string) => Effect.Effect<void, never>
  focusNext: () => Effect.Effect<void, never>
  focusPrevious: () => Effect.Effect<void, never>
  enableFocus: (nodeId: string) => Effect.Effect<void, never>
  disableFocus: (nodeId: string) => Effect.Effect<void, never>

  // Stream of focus changes
  onFocusChange: Stream.Stream<string | null, never>
}

class FocusManagerServiceImpl implements FocusManagerService {
  constructor(
    public focusState: SubscriptionRef.SubscriptionRef<FocusState>
  ) {}

  focus(nodeId: string): Effect.Effect<void, never> {
    return Effect.gen(function* () {
      const state = yield* SubscriptionRef.get(this.focusState)

      // Validate node exists in focusableNodes
      if (!state.focusableNodes.includes(nodeId)) {
        yield* Effect.logWarning(`Node ${nodeId} is not focusable`)
        return
      }

      // Update focused node
      yield* SubscriptionRef.set(this.focusState, {
        ...state,
        focusedNodeId: nodeId
      })

      yield* Effect.logDebug(`Focused node: ${nodeId}`)
    })
  }

  focusNext(): Effect.Effect<void, never> {
    return Effect.gen(function* () {
      const state = yield* SubscriptionRef.get(this.focusState)

      if (state.focusableNodes.length === 0) return

      const currentIndex = state.focusedNodeId
        ? state.focusableNodes.indexOf(state.focusedNodeId)
        : -1

      const nextIndex = (currentIndex + 1) % state.focusableNodes.length
      const nextNodeId = state.focusableNodes[nextIndex]

      yield* this.focus(nextNodeId)
    })
  }

  focusPrevious(): Effect.Effect<void, never> {
    return Effect.gen(function* () {
      const state = yield* SubscriptionRef.get(this.focusState)

      if (state.focusableNodes.length === 0) return

      const currentIndex = state.focusedNodeId
        ? state.focusableNodes.indexOf(state.focusedNodeId)
        : -1

      const prevIndex = currentIndex <= 0
        ? state.focusableNodes.length - 1
        : currentIndex - 1

      const prevNodeId = state.focusableNodes[prevIndex]

      yield* this.focus(prevNodeId)
    })
  }

  enableFocus(nodeId: string): Effect.Effect<void, never> {
    return SubscriptionRef.update(this.focusState, (state) => {
      if (state.focusableNodes.includes(nodeId)) {
        return state
      }

      const focusableNodes = [...state.focusableNodes, nodeId]
      const focusedNodeId = state.autoFocus && !state.focusedNodeId
        ? nodeId
        : state.focusedNodeId

      return {
        ...state,
        focusableNodes,
        focusedNodeId
      }
    }).pipe(Effect.asVoid)
  }

  disableFocus(nodeId: string): Effect.Effect<void, never> {
    return Effect.gen(function* () {
      const state = yield* SubscriptionRef.get(this.focusState)

      const focusableNodes = state.focusableNodes.filter(id => id !== nodeId)
      let focusedNodeId = state.focusedNodeId

      // If currently focused node is being disabled, focus next
      if (focusedNodeId === nodeId && focusableNodes.length > 0) {
        focusedNodeId = focusableNodes[0]
      } else if (focusedNodeId === nodeId) {
        focusedNodeId = null
      }

      yield* SubscriptionRef.set(this.focusState, {
        ...state,
        focusableNodes,
        focusedNodeId
      })
    })
  }

  get onFocusChange(): Stream.Stream<string | null, never> {
    return this.focusState.changes.pipe(
      Stream.map(state => state.focusedNodeId),
      Stream.changes
    )
  }
}

// Service with reactive state
export class FocusManagerService extends Effect.Service<FocusManagerService>()(
  "app/FocusManagerService",
  {
    effect: Effect.gen(function* () {
      const initialState: FocusState = {
        focusedNodeId: null,
        focusableNodes: [],
        autoFocus: true
      }

      const focusState = yield* SubscriptionRef.make(initialState)

      return new FocusManagerServiceImpl(focusState)
    }),
    dependencies: []
  }
) {}
```

---

## 2. Layer Composition and Dependency Injection

### 2.1 Application Layer Structure

```typescript
import { Layer } from "effect"

// Individual service layers are created automatically by Effect.Service
// We compose them into application layers

// Core infrastructure layer
export const InfrastructureLayer = Layer.mergeAll(
  TerminalService.Default,
  InputService.Default,
  OutputGeneratorService.Default
)

// Layout layer with dependencies
export const LayoutLayer = LayoutService.Default

// Renderer layer with all dependencies
export const RendererLayer = RendererService.Default

// Main application layer
export const AppLayer = Layer.mergeAll(
  InfrastructureLayer,
  LayoutLayer,
  RendererLayer,
  FocusManagerService.Default
)

// Alternative: provide layers with custom configuration
export const makeAppLayer = (config: AppConfig) =>
  Layer.mergeAll(
    Layer.succeed(AppConfig, config),
    AppLayer
  )
```

### 2.2 Providing Dependencies

```typescript
// Example: Running a program with all dependencies
const program = Effect.gen(function* () {
  const renderer = yield* RendererService
  const input = yield* InputService
  const focus = yield* FocusManagerService

  // Mount React element
  const tree = yield* renderer.mount(<App />)

  // Handle input events
  yield* input.inputStream.pipe(
    Stream.tap((event) => {
      if (event.key === 'tab') {
        return focus.focusNext()
      }
      return Effect.void
    }),
    Stream.runDrain
  )

  // Wait for exit
  yield* renderer.waitUntilExit()

  // Cleanup
  yield* renderer.unmount()
})

// Run with dependencies
const main = program.pipe(
  Effect.provide(AppLayer),
  Effect.scoped // Ensure proper cleanup
)

Effect.runPromise(main)
```

---

## 3. Concurrency Patterns

### 3.1 Fiber-Based Input and Rendering

```typescript
// Concurrent render and input handling
const app = Effect.gen(function* () {
  const renderer = yield* RendererService
  const input = yield* InputService

  // Fork render loop
  const renderFiber = yield* Effect.fork(
    renderer.renderLoop.pipe(
      Stream.runDrain
    )
  )

  // Fork input loop
  const inputFiber = yield* Effect.fork(
    input.inputStream.pipe(
      Stream.tap(handleInput),
      Stream.runDrain
    )
  )

  // Race: wait for exit signal or fiber interruption
  yield* Effect.race(
    Fiber.join(renderFiber),
    Fiber.join(inputFiber)
  )
})
```

### 3.2 Parallel Layout Calculation

```typescript
// Process multiple layout requests in parallel with concurrency limit
const batchLayout = (requests: Array<LayoutRequest>) =>
  Effect.forEach(
    requests,
    (request) => layoutService.calculate(request),
    {
      concurrency: 4, // Process 4 layouts in parallel
      batching: true  // Enable request batching
    }
  )
```

### 3.3 Racing Operations

```typescript
// Race layout calculation with timeout
const layoutWithTimeout = (request: LayoutRequest) =>
  Effect.race(
    layoutService.calculate(request),
    Effect.sleep("100 millis").pipe(
      Effect.flatMap(() =>
        Effect.fail(new LayoutError({ message: "Layout timeout" }))
      )
    )
  )
```

---

## 4. Stream Processing

### 4.1 Resize Event Stream

```typescript
// Handle terminal resize events
const handleResize = Effect.gen(function* () {
  const terminal = yield* TerminalService
  const renderer = yield* RendererService

  yield* terminal.onResize().pipe(
    // Debounce resize events
    Stream.debounce("100 millis"),
    Stream.tap((size) =>
      Effect.logInfo(`Terminal resized to ${size.width}x${size.height}`)
    ),
    // Trigger re-render on resize
    Stream.mapEffect((size) =>
      renderer.render(/* current tree */)
    ),
    Stream.runDrain
  )
})
```

### 4.2 Input Event Processing

```typescript
// Process input events with filtering and transformation
const processInput = Effect.gen(function* () {
  const input = yield* InputService
  const focus = yield* FocusManagerService

  yield* input.inputStream.pipe(
    // Filter control characters
    Stream.filter(event => !event.ctrl || event.key === 'c'),
    // Map to actions
    Stream.map(event => {
      switch (event.key) {
        case 'tab': return { type: 'FOCUS_NEXT' }
        case 'up': return { type: 'MOVE_UP' }
        case 'down': return { type: 'MOVE_DOWN' }
        default: return { type: 'CHAR', char: event.key }
      }
    }),
    // Process actions
    Stream.tap(action => handleAction(action)),
    Stream.runDrain
  )
})
```

---

## 5. Error Handling and Recovery

### 5.1 Typed Error Handling

```typescript
// Handle specific errors with catchTag
const renderWithRecovery = Effect.gen(function* () {
  yield* renderer.render(tree).pipe(
    Effect.catchTag("RenderError", (error) =>
      Effect.gen(function* () {
        yield* Effect.logError("Render failed", error)
        // Fallback to previous render
        return Effect.void
      })
    ),
    Effect.catchTag("LayoutError", (error) =>
      Effect.gen(function* () {
        yield* Effect.logWarning("Layout failed, using cached", error)
        // Use cached layout
        return Effect.void
      })
    )
  )
})
```

### 5.2 Retry with Exponential Backoff

```typescript
// Retry failed operations with exponential backoff
const layoutWithRetry = layoutService.calculate(request).pipe(
  Effect.retry(
    Schedule.exponential("100 millis").pipe(
      Schedule.compose(Schedule.recurs(5)),
      Schedule.jittered
    )
  ),
  Effect.timeout("5 seconds"),
  Effect.catchAll((error) =>
    Effect.gen(function* () {
      yield* Effect.logError("Layout failed after retries", error)
      return defaultLayout
    })
  )
)
```

### 5.3 Error Accumulation

```typescript
// Accumulate errors from parallel operations
const processNodesWithErrors = Effect.forEach(
  nodes,
  (node) => processNode(node).pipe(
    Effect.either // Convert to Either<Error, Result>
  ),
  { concurrency: "unbounded" }
).pipe(
  Effect.map(results => {
    const errors = results.filter(Either.isLeft)
    const successes = results.filter(Either.isRight)

    return {
      successes: successes.map(e => e.right),
      errors: errors.map(e => e.left)
    }
  })
)
```

---

## 6. Resource Management

### 6.1 Scoped Resources

```typescript
// Automatic resource cleanup with Scope
const withTerminal = Effect.scoped(
  Effect.gen(function* () {
    const terminal = yield* TerminalService

    // Terminal is automatically cleaned up when scope exits
    yield* terminal.enterAlternateScreen()

    // Do work
    yield* performRendering()

    // Cleanup happens automatically via finalizers
  })
)
```

### 6.2 Acquire-Release Pattern

```typescript
// Manual resource management
const withYogaNode = (renderNode: RenderNode) =>
  Effect.acquireRelease(
    layoutService.createYogaNode(renderNode),
    (yogaNode) => layoutService.destroyYogaNode(yogaNode)
  )

// Use the resource
const processWithYoga = Effect.gen(function* () {
  const yogaNode = yield* withYogaNode(renderNode)

  // Use yogaNode safely
  yield* layoutService.applyStyles(yogaNode, props)

  // yogaNode is automatically destroyed when effect completes
})
```

### 6.3 Resource Pooling

```typescript
// Pool of Yoga nodes for reuse
const makeYogaNodePool = Effect.gen(function* () {
  const pool = yield* Pool.make({
    acquire: layoutService.createYogaNode(emptyNode),
    size: 10
  })

  return {
    withNode: <A, E, R>(f: (node: YogaNode) => Effect.Effect<A, E, R>) =>
      Pool.get(pool).pipe(
        Effect.flatMap(f)
      )
  }
})
```

---

## 7. Testing with Effect

### 7.1 Mock Layers

```typescript
// Create mock terminal service for testing
export class MockTerminalService implements TerminalService {
  private outputs: Array<ANTMLOutput> = []

  write(output: ANTMLOutput): Effect.Effect<void, TerminalError> {
    return Effect.sync(() => {
      this.outputs.push(output)
    })
  }

  getOutputHistory(): Array<ANTMLOutput> {
    return this.outputs
  }

  // Implement other methods as no-ops or mocks
  clear = () => Effect.void
  enterAlternateScreen = () => Effect.void
  exitAlternateScreen = () => Effect.void
  showCursor = () => Effect.void
  hideCursor = () => Effect.void
  getSize = () => Effect.succeed({ width: 80, height: 24 })
  onResize = () => Stream.empty
}

// Create mock layer
export const MockTerminalLayer = Layer.succeed(
  TerminalService,
  new MockTerminalService()
)
```

### 7.2 Test Utilities

```typescript
// Render component in test environment
export const renderTest = (element: ReactElement) =>
  Effect.gen(function* () {
    const renderer = yield* RendererService
    const terminal = yield* TerminalService

    // Mount and render
    const tree = yield* renderer.mount(element)
    yield* renderer.render(tree)

    // Get output
    const mockTerminal = terminal as MockTerminalService
    const output = mockTerminal.getOutputHistory()

    return {
      tree,
      output,
      lastFrame: output[output.length - 1]?.content ?? ""
    }
  }).pipe(
    Effect.provide(Layer.mergeAll(
      MockTerminalLayer,
      LayoutService.Default,
      OutputGeneratorService.Default,
      RendererService.DefaultWithoutDependencies
    )),
    Effect.scoped
  )
```

### 7.3 TestContext and TestClock

```typescript
import { TestContext, TestClock } from "effect"

// Test with controlled time
const testWithClock = Effect.gen(function* () {
  // Adjust time
  yield* TestClock.adjust("1 second")

  // Verify time-dependent behavior
  const result = yield* someTimedOperation()

  expect(result).toBe(expected)
}).pipe(
  Effect.provide(TestContext.TestContext)
)
```

---

## 8. Performance Optimizations

### 8.1 Batching with Effect.forEach

```typescript
// Batch updates for efficient processing
const batchedUpdates = Effect.gen(function* () {
  const updates = yield* getUpdates()

  // Process in batches of 50
  yield* Effect.forEach(
    Chunk.chunksOf(updates, 50),
    (batch) => processBatch(batch),
    {
      concurrency: 2, // Process 2 batches in parallel
      batching: true  // Enable automatic batching
    }
  )
})
```

### 8.2 Caching with Effect Cache

```typescript
// Cache layout results with TTL
const makeLayoutCache = Effect.gen(function* () {
  const cache = yield* Cache.make({
    capacity: 1000,
    timeToLive: Duration.millis(100),
    lookup: (key: string) =>
      Effect.fail(new LayoutError({ message: "Cache miss" }))
  })

  return {
    getOrCompute: (key: string, compute: Effect.Effect<LayoutResult, LayoutError>) =>
      Cache.get(cache, key, compute)
  }
})
```

### 8.3 Memoization

```typescript
// Memoize expensive computations
const memoizedLayout = Effect.cachedFunction(
  (request: LayoutRequest) => layoutService.calculate(request),
  {
    capacity: 100,
    timeToLive: Duration.millis(100)
  }
)
```

### 8.4 Stream Buffering and Throttling

```typescript
// Buffer and throttle output writes
const bufferedWrites = writeStream.pipe(
  Stream.buffer({ capacity: 100 }),
  Stream.throttle({
    cost: Chunk.size,
    units: 1000,
    duration: "1 second"
  }),
  Stream.runDrain
)
```

---

## 9. Main Entry Point

**Location**: `src/index.ts`

```typescript
import { Effect, Layer, Scope } from "effect"
import type { ReactElement } from "react"

export interface RenderOptions {
  stdout?: Writable
  stdin?: Readable
  stderr?: Writable
  debug?: boolean
  exitOnCtrlC?: boolean
  patchConsole?: boolean
}

export interface RenderInstance {
  tree: RenderTree
  exit: () => Effect.Effect<void, RenderError>
  waitUntilExit: () => Effect.Effect<void, never>
  clear: () => Effect.Effect<void, RenderError>
  rerender: (element: ReactElement) => Effect.Effect<void, RenderError>
}

export function render(
  element: ReactElement,
  options?: RenderOptions
): Effect.Effect<RenderInstance, InkError> {
  return Effect.gen(function* () {
    // Create app config
    const config = createAppConfig(options)

    // Main program with all services
    const program = Effect.gen(function* () {
      const renderer = yield* RendererService
      const terminal = yield* TerminalService

      // Mount element
      const tree = yield* renderer.mount(element)

      // Create instance API
      const instance: RenderInstance = {
        tree,
        exit: () => renderer.unmount(),
        waitUntilExit: () => renderer.waitUntilExit(),
        clear: () => terminal.clear(),
        rerender: (newElement) =>
          Effect.gen(function* () {
            yield* renderer.unmount()
            const newTree = yield* renderer.mount(newElement)
            instance.tree = newTree
          })
      }

      return instance
    })

    // Run with layers and scoping
    return yield* program.pipe(
      Effect.provide(AppLayer),
      Effect.provide(Layer.succeed(AppConfig, config)),
      Effect.scoped // Ensure cleanup
    )
  })
}

// Helper to create app config
function createAppConfig(options?: RenderOptions): AppConfig {
  return {
    stdout: options?.stdout ?? process.stdout,
    stdin: options?.stdin ?? process.stdin,
    stderr: options?.stderr ?? process.stderr,
    debug: options?.debug ?? false,
    exitOnCtrlC: options?.exitOnCtrlC ?? true,
    patchConsole: options?.patchConsole ?? false
  }
}

// Export main API
export { Effect, Layer }
export * from "./services"
export * from "./components"
```

---

## 10. Summary

### Key Effect Patterns Applied

1. **Fiber-Based Concurrency**:
   - Render loop runs in background fiber
   - Input processing in separate fiber
   - Parallel layout calculation with concurrency limits
   - Race conditions for timeouts and exit handling

2. **Stream API Integration**:
   - Terminal resize events as streams
   - Input events as streams with filtering and transformation
   - Update queue as stream for batched rendering
   - Write buffering with streams

3. **Resource Management**:
   - Scoped terminal lifecycle (alternate screen, cursor)
   - Acquire-release for Yoga nodes
   - Automatic cleanup with finalizers
   - Resource pooling for performance

4. **Service and Layer Composition**:
   - Effect.Service for streamlined service definition
   - Layer composition with proper dependencies
   - Mock layers for testing
   - Clean dependency injection

5. **Typed Error Handling**:
   - Tagged errors with Data.TaggedError
   - catchTag for specific error recovery
   - Retry with schedules and exponential backoff
   - Error accumulation from parallel operations

6. **Performance Optimizations**:
   - Caching with TTL for layout results
   - Batching updates within time windows
   - Throttling writes for efficiency
   - Memoization of expensive computations
   - Parallel processing with concurrency control

7. **Testing Infrastructure**:
   - Mock layers for services
   - Test utilities for component rendering
   - TestContext and TestClock for controlled testing
   - Effect-aware assertions

### Critical Execution Paths

1. **Mount**:
   - `render()` → `RendererService.mount()` → reconciler setup → fiber spawn → terminal init (scoped)

2. **Render Loop**:
   - Update queue stream → batch updates → layout calculation (cached) → diff generation → ANTML output → write (buffered)

3. **Input Processing**:
   - Input stream → parse → filter → map to actions → handle with focus/renderer

4. **Layout**:
   - Cache lookup → Yoga calculation → traverse tree (parallel) → extract positions

5. **Cleanup**:
   - Interrupt fibers → unmount reconciler → exit alternate screen (finalizer) → restore terminal

---

**Document Version**: 2.0 (Enhanced with Effect Patterns)
**Created**: 2025-10-27
**Status**: Enhanced with Effect TypeScript patterns
