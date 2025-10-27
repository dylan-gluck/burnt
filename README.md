# effect-bun-cli

A production-ready CLI application scaffolding built with Bun runtime and Effect-TS, demonstrating best practices for building type-safe, composable CLI tools.

## Features

- **Effect-TS Architecture**: Service/Layer pattern for dependency injection
- **Type-Safe**: Full TypeScript with strict mode enabled
- **Bun Runtime**: Fast JavaScript runtime with native TypeScript support
- **Structured Services**: ConfigService, LoggerService, and GreetingService examples
- **Error Handling**: Typed errors with Effect's error channel
- **Testing**: Effect testing patterns with test layers
- **Linting/Formatting**: Biome for fast code quality checks

## Installation

```bash
bun install
```

## Usage

### Run the CLI

```bash
# Show help
bun run src/index.ts --help

# Greet someone
bun run src/index.ts greet Alice

# Greet with time-based prefix (Good morning/afternoon/evening)
bun run src/index.ts greet Bob --time

# Show version
bun run src/index.ts version
```

### Development Scripts

```bash
# Run the CLI
bun run dev

# Build for production
bun run build

# Run the built executable
./dist/cli greet Alice
./dist/cli version

# Run tests
bun test

# Lint code
bun run lint

# Format code
bun run format

# Type check
bun run typecheck
```

### Building for Production

Two build options are available:

#### Option 1: Bundled Executable (Recommended for Production)

Creates a small bundle with external Effect dependencies:

```bash
bun run build
chmod +x dist/cli
./dist/cli --help
```

**Bundle size**: ~8KB
**Requires**: `node_modules` with Effect packages must be present
**Best for**: Production deployment where dependencies can be installed

#### Option 2: Direct Source Execution (Development)

Run TypeScript directly with Bun (no build step needed):

```bash
bun run src/index.ts greet Alice
```

**Bundle size**: ~24KB source files
**Requires**: Source files and `node_modules` (161MB)
**Best for**: Development and fastest iteration

### Distribution Options

For deploying the CLI to production environments:

1. **With npm/bun**: Publish to npm registry and users can install with `bun install -g effect-bun-cli`
2. **Docker**: Create a Docker image with Bun runtime + bundled executable
3. **Direct deployment**: Copy `dist/cli` and `node_modules` to the server and run with Bun

**Note**: Bun's `--compile` flag for standalone binaries is not compatible with `@effect/platform-node` at this time.

## Project Structure

```
src/
├── index.ts              # Main entry point
├── cli/
│   └── commands.ts       # CLI command definitions (deprecated - using manual parsing)
├── services/
│   ├── ConfigService.ts  # Configuration management
│   ├── LoggerService.ts  # Structured logging
│   ├── GreetingService.ts # Example business logic
│   └── GreetingService.test.ts # Tests
└── config/              # Configuration files (unused)
```

## Architecture

### Services

**ConfigService**: Manages application configuration with Schema validation
- Environment-based config (development/production/test)
- Type-safe config access
- Schema validation using @effect/schema

**LoggerService**: Structured logging with log levels
- Depends on ConfigService for log level configuration
- Formatted output with timestamps
- Multiple log levels (debug, info, warn, error)

**GreetingService**: Example business logic service
- Depends on both ConfigService and LoggerService
- Demonstrates error handling with typed errors
- Input validation and business logic

### Layer Composition

Services are composed using Effect's Layer system:

```typescript
const AppLayer = Layer.mergeAll(
  ConfigServiceLive,
  LoggerServiceLive.pipe(Layer.provide(ConfigServiceLive)),
  GreetingServiceLive.pipe(
    Layer.provide(
      Layer.mergeAll(ConfigServiceLive, LoggerServiceLive.pipe(Layer.provide(ConfigServiceLive)))
    )
  )
)
```

### Testing

Tests use Effect's testing patterns with mock layers:

```typescript
const TestLayer = Layer.mergeAll(
  ConfigServiceTest,
  LoggerServiceTest,
  GreetingServiceLive.pipe(
    Layer.provide(Layer.mergeAll(ConfigServiceTest, LoggerServiceTest))
  )
)
```

## Environment Variables

- `NODE_ENV`: Set environment (development/production/test)
- `LOG_LEVEL`: Set logging level (debug/info/warn/error)

## Tech Stack

- **Runtime**: Bun v1.2.20
- **Type System**: TypeScript 5.9.3
- **Effect Libraries**:
  - effect@3.18.4
  - @effect/platform@0.92.1
  - @effect/platform-node@0.98.4
  - @effect/schema@0.75.5
  - @effect/cli@0.71.0 (installed but not currently used)
- **Tooling**: Biome 2.3.1 for linting and formatting

## Key Patterns

1. **Service Definition**: Using `Context.GenericTag` for dependency injection
2. **Layer Creation**: Using `Layer.effect` for service implementations
3. **Error Handling**: Using `Data.TaggedError` for typed errors
4. **Effect Composition**: Using `Effect.gen` for sequential operations
5. **Dependency Injection**: Using `Layer.provide` for service dependencies

## License

This project was created using `bun init` in bun v1.2.20.
