/**
 * Error Types for Ink Port
 *
 * All errors use Effect's Data.TaggedError for compile-time error tracking
 * and integration with Effect's error channel.
 *
 * These errors will be used throughout Effect services for:
 * - Compile-time error type tracking
 * - Pattern matching with Effect.catchTag()
 * - Automatic error serialization
 * - Stack trace capture
 */

import { Data } from "effect";

/**
 * RenderError - Errors during render tree operations
 *
 * Thrown when:
 * - Render tree construction fails
 * - Node mounting/unmounting fails
 * - Render tree updates fail
 * - Invalid render node operations
 */
export class RenderError extends Data.TaggedError("RenderError")<{
	readonly message: string;
	readonly cause?: unknown;
	readonly nodeId?: string;
}> {}

/**
 * LayoutError - Errors during layout calculation
 *
 * Thrown when:
 * - Yoga layout calculation fails
 * - Invalid layout properties
 * - Layout tree inconsistencies
 * - Yoga node creation/destruction fails
 */
export class LayoutError extends Data.TaggedError("LayoutError")<{
	readonly message: string;
	readonly cause?: unknown;
	readonly nodeId?: string;
}> {}

/**
 * TerminalError - Errors during terminal I/O operations
 *
 * Thrown when:
 * - Terminal write operations fail
 * - Screen buffer operations fail
 * - Cursor manipulation fails
 * - Terminal size detection fails
 */
export class TerminalError extends Data.TaggedError("TerminalError")<{
	readonly message: string;
	readonly cause?: unknown;
}> {}

/**
 * InputError - Errors during input handling
 *
 * Thrown when:
 * - Input stream capture fails
 * - Raw mode toggle fails
 * - Input parsing fails
 * - Input event handling fails
 */
export class InputError extends Data.TaggedError("InputError")<{
	readonly message: string;
	readonly cause?: unknown;
}> {}

/**
 * OutputError - Errors during output generation
 *
 * Thrown when:
 * - Output buffer generation fails
 * - Output diffing fails
 * - ANTML conversion fails
 * - Output segment rendering fails
 */
export class OutputError extends Data.TaggedError("OutputError")<{
	readonly message: string;
	readonly cause?: unknown;
	readonly nodeId?: string;
}> {}

/**
 * FocusError - Errors during focus management
 *
 * Thrown when:
 * - Focus target node not found
 * - Focus navigation fails
 * - Invalid focus operations
 * - Focus state inconsistencies
 */
export class FocusError extends Data.TaggedError("FocusError")<{
	readonly message: string;
	readonly nodeId?: string;
}> {}

/**
 * InkError - Union of all error types
 *
 * Use this type when:
 * - Handling any Ink error generically
 * - Pattern matching across all error types
 * - Defining catch-all error handlers
 */
export type InkError =
	| RenderError
	| LayoutError
	| TerminalError
	| InputError
	| OutputError
	| FocusError;

/**
 * Helper Functions for Creating Errors
 *
 * These helpers provide ergonomic error construction:
 * - Type inference for error properties
 * - Clear, concise error creation
 * - Consistent error structure
 */

/**
 * Create a RenderError
 *
 * @example
 * ```ts
 * return Effect.fail(renderError({
 *   message: "Failed to mount component",
 *   nodeId: "root-1",
 *   cause: err
 * }))
 * ```
 */
export const renderError = (params: {
	message: string;
	cause?: unknown;
	nodeId?: string;
}): RenderError => new RenderError(params);

/**
 * Create a LayoutError
 *
 * @example
 * ```ts
 * return Effect.fail(layoutError({
 *   message: "Invalid flexbox properties",
 *   nodeId: "box-1"
 * }))
 * ```
 */
export const layoutError = (params: {
	message: string;
	cause?: unknown;
	nodeId?: string;
}): LayoutError => new LayoutError(params);

/**
 * Create a TerminalError
 *
 * @example
 * ```ts
 * return Effect.fail(terminalError({
 *   message: "Failed to write to stdout",
 *   cause: err
 * }))
 * ```
 */
export const terminalError = (params: {
	message: string;
	cause?: unknown;
}): TerminalError => new TerminalError(params);

/**
 * Create an InputError
 *
 * @example
 * ```ts
 * return Effect.fail(inputError({
 *   message: "Failed to enable raw mode",
 *   cause: err
 * }))
 * ```
 */
export const inputError = (params: {
	message: string;
	cause?: unknown;
}): InputError => new InputError(params);

/**
 * Create an OutputError
 *
 * @example
 * ```ts
 * return Effect.fail(outputError({
 *   message: "Failed to generate output buffer",
 *   nodeId: "text-1",
 *   cause: err
 * }))
 * ```
 */
export const outputError = (params: {
	message: string;
	cause?: unknown;
	nodeId?: string;
}): OutputError => new OutputError(params);

/**
 * Create a FocusError
 *
 * @example
 * ```ts
 * return Effect.fail(focusError({
 *   message: "Focus target node not found",
 *   nodeId: "input-1"
 * }))
 * ```
 */
export const focusError = (params: {
	message: string;
	nodeId?: string;
}): FocusError => new FocusError(params);
