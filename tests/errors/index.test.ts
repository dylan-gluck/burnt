/**
 * Unit tests for Error Types
 *
 * Tests Effect's Data.TaggedError pattern for all Ink error types:
 * - Error creation (constructor and helper functions)
 * - Error properties (_tag, message, cause, nodeId)
 * - Error serialization (Data.TaggedError provides this)
 * - Integration with Effect's error channel
 * - Type narrowing with _tag discriminator
 */

import { describe, expect, test } from "bun:test";
import { Effect, Either } from "effect";
import {
	focusError,
	type InkError,
	inputError,
	type LayoutError,
	layoutError,
	outputError,
	type RenderError,
	renderError,
	terminalError,
} from "../../src/errors/index.js";

// Test Helpers & Factories

type ErrorFactory = (opts: {
	message: string;
	nodeId?: string;
	cause?: Error | null;
}) => InkError;

const errorFactories = {
	RenderError: renderError,
	LayoutError: layoutError,
	TerminalError: terminalError,
	InputError: inputError,
	OutputError: outputError,
	FocusError: focusError,
} as const;

const errorsWithNodeId = [
	"RenderError",
	"LayoutError",
	"OutputError",
	"FocusError",
] as const;
const errorsWithCause = [
	"RenderError",
	"LayoutError",
	"TerminalError",
	"InputError",
	"OutputError",
] as const;

const testEffectCatch = async (factory: ErrorFactory, tag: string) => {
	const program = Effect.fail(factory({ message: "Test error" })).pipe(
		Effect.catchTag(tag as never, (err: InkError) =>
			Effect.succeed(`Caught: ${err.message}`)
		)
	);
	return Effect.runPromise(program);
};

// Tests

describe("Error Types", () => {
	describe.each(Object.entries(errorFactories))("%s", (tag, factory) => {
		test("creates error with constructor and helper function", () => {
			const error = factory({ message: "Test message" });
			expect(error._tag).toBe(tag);
			expect(error.message).toBe("Test message");
		});

		if (errorsWithNodeId.includes(tag as never)) {
			test("supports nodeId property", () => {
				const withNodeId = factory({ message: "Test", nodeId: "node-1" });
				const withoutNodeId = factory({ message: "Test" });

				expect(withNodeId.nodeId).toBe("node-1");
				expect(withoutNodeId.nodeId).toBeUndefined();
			});
		}

		if (errorsWithCause.includes(tag as never)) {
			test("includes cause when provided", () => {
				const cause = new Error("Underlying error");
				const error = factory({ message: "Test", cause });
				expect(error.cause).toBe(cause);
			});
		}

		test("works with Effect.fail and Effect.catchTag", async () => {
			const result = await testEffectCatch(factory, tag);
			expect(result).toBe("Caught: Test error");
		});

		test("serializes correctly", () => {
			const error = factory({ message: "Test message" });
			const serialized = JSON.parse(JSON.stringify(error));
			expect(serialized._tag).toBe(tag);
			expect(serialized.message).toBe("Test message");
		});
	});

	describe("InkError (Union Type)", () => {
		test("accepts all error types", () => {
			const errors: InkError[] = Object.values(errorFactories).map((factory) =>
				factory({ message: "Test" })
			);
			const expectedTags = Object.keys(errorFactories);

			expect(errors.map((e) => e._tag)).toEqual(expectedTags);
			expect(
				errors.every(
					(_e, i) =>
						errors.filter((err) => err._tag === expectedTags[i]).length === 1
				)
			).toBe(true);
		});

		test("supports exhaustive pattern matching", () => {
			const handleError = (error: InkError): string =>
				`${error._tag.replace("Error", "")}: ${error.message}`;

			expect(handleError(renderError({ message: "test" }))).toBe(
				"Render: test"
			);
			expect(handleError(layoutError({ message: "test" }))).toBe(
				"Layout: test"
			);
			expect(handleError(terminalError({ message: "test" }))).toBe(
				"Terminal: test"
			);
		});
	});

	describe("Effect Integration", () => {
		test("works with Effect.catchTags for multiple error types", async () => {
			const program = (errorType: "render" | "layout") => {
				const effect: Effect.Effect<never, RenderError | LayoutError, never> =
					errorType === "render"
						? Effect.fail(renderError({ message: "Render failed" }))
						: Effect.fail(layoutError({ message: "Layout failed" }));

				return effect.pipe(
					Effect.catchTags({
						RenderError: (err) => Effect.succeed(`Render: ${err.message}`),
						LayoutError: (err) => Effect.succeed(`Layout: ${err.message}`),
					})
				);
			};

			const [result1, result2] = await Promise.all([
				Effect.runPromise(program("render")),
				Effect.runPromise(program("layout")),
			]);

			expect(result1).toBe("Render: Render failed");
			expect(result2).toBe("Layout: Layout failed");
		});

		test("captures error in Either", async () => {
			const program = Effect.fail(renderError({ message: "Test error" }));
			const result = await Effect.runPromise(Effect.either(program));

			expect(Either.isLeft(result)).toBe(true);
			if (Either.isLeft(result)) {
				expect(result.left._tag).toBe("RenderError");
				expect(result.left.message).toBe("Test error");
			}
		});

		test("supports error transformation", async () => {
			const program = Effect.fail(
				renderError({ message: "Original error", nodeId: "node-1" })
			).pipe(
				Effect.catchTag("RenderError", (err) =>
					Effect.fail(
						layoutError({
							message: `Transformed from render: ${err.message}`,
							nodeId: err.nodeId,
						})
					)
				)
			);

			const result = await Effect.runPromise(Effect.either(program));

			expect(Either.isLeft(result)).toBe(true);
			if (Either.isLeft(result)) {
				expect(result.left._tag).toBe("LayoutError");
				expect(result.left.message).toBe(
					"Transformed from render: Original error"
				);
			}
		});

		test("supports error chaining with cause", async () => {
			const originalError = new Error("Original cause");
			const renderErr = renderError({
				message: "Render failed",
				cause: originalError,
			});

			const program = Effect.fail(renderErr);
			const result = await Effect.runPromise(Effect.either(program));

			expect(Either.isLeft(result)).toBe(true);
			if (Either.isLeft(result)) {
				expect(result.left.cause).toBe(originalError);
			}
		});

		test("works with Effect.gen", async () => {
			const program = Effect.gen(function* () {
				const value = yield* Effect.succeed(42);

				if (value > 40) {
					return yield* Effect.fail(
						renderError({ message: "Value too large" })
					);
				}

				return value;
			});

			const result = await Effect.runPromise(Effect.either(program));

			expect(Either.isLeft(result)).toBe(true);
			if (Either.isLeft(result)) {
				expect(result.left._tag).toBe("RenderError");
			}
		});
	});

	describe("Type Safety", () => {
		test("supports optional properties", () => {
			const error1 = renderError({ message: "Test" });
			const error2 = renderError({ message: "Test", nodeId: "node-1" });
			const error3 = renderError({
				message: "Test",
				cause: new Error("Cause"),
			});

			expect(error1.nodeId).toBeUndefined();
			expect(error1.cause).toBeUndefined();
			expect(error2.nodeId).toBe("node-1");
			expect(error3.cause).toBeInstanceOf(Error);
		});

		test("maintains type information through Effect chains", async () => {
			const program = Effect.fail(renderError({ message: "Test" })).pipe(
				Effect.catchTag("RenderError", (err) => {
					const nodeId: string | undefined = err.nodeId;
					return Effect.succeed(nodeId ?? "no-node");
				})
			);

			const result = await Effect.runPromise(program);
			expect(result).toBe("no-node");
		});
	});

	describe("Edge Cases", () => {
		test.each([
			["empty message", ""],
			["long message", "x".repeat(1000)],
			["special characters", 'Test "quotes" and \n newlines \t tabs'],
		])("handles %s", (_label, message) => {
			const error = renderError({ message });
			expect(error.message).toBe(message);
		});

		test("handles null and undefined", () => {
			const error1 = inputError({ message: "Test", cause: null });
			const error2 = outputError({
				message: "Test",
				cause: undefined,
				nodeId: undefined,
			});

			expect(error1.cause).toBeNull();
			expect(error2.cause).toBeUndefined();
			expect(error2.nodeId).toBeUndefined();
		});
	});
});
