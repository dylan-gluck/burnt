# <Burnt />

Build beautiful command-line interfaces with React, powered by Bun and Effect.

A modern, type-safe port of [Ink](https://github.com/vadimdemedes/ink) that leverages Bun's performance and Effect's composable error handling. Use familiar React patterns to create interactive CLI applications.

## Features

- **React Components** - Build terminal UIs with the same component model you know from web development
- **Bun Runtime** - Fast startup and execution with Bun's native TypeScript support
- **Effect Integration** - Type-safe error handling and composable abstractions
- **Flexbox Layout** - Yoga layout engine for powerful terminal layouts
- **100% Ink Compatible** - Drop-in replacement for existing Ink applications

## Installation

```bash
bun add burnt
```

## Quick Start

```tsx
import { render, Text, Box } from 'burnt'

function App() {
  return (
    <Box flexDirection="column" padding={1}>
      <Text color="green" bold>
        Hello World!
      </Text>
      <Text dimColor>
        Your first CLI app with React
      </Text>
    </Box>
  )
}

const { waitUntilExit } = render(<App />)
await waitUntilExit()
```

## Core Components

### Text

Display styled text in the terminal.

```tsx
<Text color="cyan" bold underline>
  Styled text
</Text>

<Text backgroundColor="#FF0000" color="white">
  Custom colors
</Text>
```

### Box

Layout container using flexbox.

```tsx
<Box
  flexDirection="column"
  padding={2}
  borderStyle="round"
  borderColor="cyan"
>
  <Text>Flexbox layouts in your terminal</Text>
</Box>
```

### Other Components

- **Newline** - Insert line breaks
- **Spacer** - Flexible spacing between elements
- **Static** - Render content that doesn't update
- **Transform** - Transform child text content

## Interactive Input

### Keyboard Input

```tsx
import { useInput } from 'burnt'

function App() {
  const [count, setCount] = useState(0)

  useInput((input, key) => {
    if (key.name === 'up') setCount(c => c + 1)
    if (key.name === 'down') setCount(c => c - 1)
  })

  return (
    <Text>
      Counter: <Text color="cyan">{count}</Text>
    </Text>
  )
}
```

### Focus Management

```tsx
import { useFocus, useFocusManager } from 'burnt'

function MenuItem({ label }) {
  const { isFocused } = useFocus()

  return (
    <Text color={isFocused ? 'cyan' : 'white'}>
      {isFocused ? '❯ ' : '  '}{label}
    </Text>
  )
}

function Menu() {
  const { focusNext, focusPrevious } = useFocusManager()

  useInput((input, key) => {
    if (key.name === 'up') focusPrevious()
    if (key.name === 'down') focusNext()
  })

  return (
    <Box flexDirection="column">
      <MenuItem label="Option 1" />
      <MenuItem label="Option 2" />
      <MenuItem label="Option 3" />
    </Box>
  )
}
```

## Available Hooks

- **useInput** - Capture keyboard input
- **useApp** - Access app instance for exit and control
- **useStdin** - Access stdin stream
- **useStdout** - Access stdout stream
- **useStderr** - Access stderr stream
- **useFocus** - Manage component focus state
- **useFocusManager** - Programmatic focus control

## Development

```bash
# Install dependencies
bun install

# Run tests
bun test

# Type check
bun run typecheck

# Lint and format
bun run lint
bun run format
```

## Examples

Check out the `examples/` directory for more complete applications:

- **basic.tsx** - Simple "Hello World" example
- **counter.tsx** - Interactive counter with keyboard input
- **menu.tsx** - Navigable menu with focus management

## Architecture

Built on:
- **React 19** - Modern React with concurrent features
- **Bun** - Fast JavaScript runtime
- **Effect** - Type-safe error handling and resource management
- **Yoga** - Flexbox layout engine
