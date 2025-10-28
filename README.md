# effect-bun-cli

A production-ready CLI application scaffolding built with Bun runtime and Effect-TS, demonstrating best practices for building type-safe, composable CLI tools.

## Features

- **Effect-TS Architecture**: Service/Layer pattern for dependency injection
- **Type-Safe**: Full TypeScript with strict mode enabled
- **Bun Runtime**: Fast JavaScript runtime with native TypeScript support
- **Structured Services**: ConfigService, LoggerService, and GreetingService examples
- **Error Handling**: Typed errors with Effect's error channel
- **Testing**: Bun:test + Effect testing patterns with test layers
- **Linting/Formatting**: Biome for fast code quality checks

## Installation

```bash
bun install
```

## Usage

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
