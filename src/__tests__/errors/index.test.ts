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
	FocusError,
	focusError,
	type InkError,
	InputError,
	inputError,
	LayoutError,
	layoutError,
	OutputError,
	outputError,
	RenderError,
	renderError,
	TerminalError,
	terminalError,
} from "../../errors/index.js";

describe("Error Types", () => {
	describe("RenderError", () => {
		test("should create error with constructor", () => {
			const error = new RenderError({
				message: "Failed to render",
				nodeId: "node-1",
			});

			expect(error._tag).toBe("RenderError");
			expect(error.message).toBe("Failed to render");
			expect(error.nodeId).toBe("node-1");
			expect(error.cause).toBeUndefined();
		});

		test("should create error with helper function", () => {
			const error = renderError({
				message: "Failed to mount component",
				nodeId: "root-1",
			});

			expect(error._tag).toBe("RenderError");
			expect(error.message).toBe("Failed to mount component");
			expect(error.nodeId).toBe("root-1");
		});

		test("should include cause when provided", () => {
			const cause = new Error("Underlying error");
			const error = renderError({
				message: "Render failed",
				cause,
				nodeId: "box-1",
			});

			expect(error.cause).toBe(cause);
		});

		test("should work without nodeId", () => {
			const error = renderError({
				message: "General render error",
			});

			expect(error._tag).toBe("RenderError");
			expect(error.message).toBe("General render error");
			expect(error.nodeId).toBeUndefined();
		});

		test("should work in Effect.fail", async () => {
			const program = Effect.fail(
				renderError({
					message: "Test error",
					nodeId: "node-1",
				})
			);

			const result = await Effect.runPromise(Effect.either(program));

			expect(Either.isLeft(result)).toBe(true);
			if (Either.isLeft(result)) {
				expect(result.left._tag).toBe("RenderError");
				expect(result.left.message).toBe("Test error");
			}
		});

		test("should be catchable with Effect.catchTag", async () => {
			const program = Effect.fail(renderError({ message: "Test error" })).pipe(
				Effect.catchTag("RenderError", (err) =>
					Effect.succeed(`Caught: ${err.message}`)
				)
			);

			const result = await Effect.runPromise(program);
			expect(result).toBe("Caught: Test error");
		});
	});

	describe("LayoutError", () => {
		test("should create error with constructor", () => {
			const error = new LayoutError({
				message: "Layout calculation failed",
				nodeId: "box-1",
			});

			expect(error._tag).toBe("LayoutError");
			expect(error.message).toBe("Layout calculation failed");
			expect(error.nodeId).toBe("box-1");
		});

		test("should create error with helper function", () => {
			const error = layoutError({
				message: "Invalid flexbox properties",
				nodeId: "container-1",
			});

			expect(error._tag).toBe("LayoutError");
			expect(error.message).toBe("Invalid flexbox properties");
			expect(error.nodeId).toBe("container-1");
		});

		test("should include cause when provided", () => {
			const cause = new Error("Yoga error");
			const error = layoutError({
				message: "Yoga node creation failed",
				cause,
			});

			expect(error.cause).toBe(cause);
		});

		test("should work in Effect chains", async () => {
			const program = Effect.fail(
				layoutError({ message: "Layout error" })
			).pipe(Effect.catchTag("LayoutError", () => Effect.succeed("recovered")));

			const result = await Effect.runPromise(program);
			expect(result).toBe("recovered");
		});
	});

	describe("TerminalError", () => {
		test("should create error with constructor", () => {
			const error = new TerminalError({
				message: "Failed to write to terminal",
			});

			expect(error._tag).toBe("TerminalError");
			expect(error.message).toBe("Failed to write to terminal");
		});

		test("should create error with helper function", () => {
			const error = terminalError({
				message: "Terminal size detection failed",
			});

			expect(error._tag).toBe("TerminalError");
			expect(error.message).toBe("Terminal size detection failed");
		});

		test("should include cause when provided", () => {
			const cause = new Error("stdout error");
			const error = terminalError({
				message: "Write failed",
				cause,
			});

			expect(error.cause).toBe(cause);
		});

		test("should not have nodeId property", () => {
			const error = terminalError({
				message: "Test error",
			});

			// TypeScript would error if we tried to access nodeId
			expect("nodeId" in error).toBe(false);
		});

		test("should work in Effect chains", async () => {
			const program = Effect.fail(
				terminalError({ message: "Terminal error" })
			).pipe(
				Effect.catchTag("TerminalError", (err) =>
					Effect.succeed(`Handled: ${err.message}`)
				)
			);

			const result = await Effect.runPromise(program);
			expect(result).toBe("Handled: Terminal error");
		});
	});

	describe("InputError", () => {
		test("should create error with constructor", () => {
			const error = new InputError({
				message: "Failed to enable raw mode",
			});

			expect(error._tag).toBe("InputError");
			expect(error.message).toBe("Failed to enable raw mode");
		});

		test("should create error with helper function", () => {
			const error = inputError({
				message: "Input stream capture failed",
			});

			expect(error._tag).toBe("InputError");
			expect(error.message).toBe("Input stream capture failed");
		});

		test("should include cause when provided", () => {
			const cause = new Error("stdin error");
			const error = inputError({
				message: "Raw mode failed",
				cause,
			});

			expect(error.cause).toBe(cause);
		});

		test("should work in Effect chains", async () => {
			const program = Effect.fail(inputError({ message: "Input error" })).pipe(
				Effect.catchTag("InputError", () => Effect.succeed("fallback"))
			);

			const result = await Effect.runPromise(program);
			expect(result).toBe("fallback");
		});
	});

	describe("OutputError", () => {
		test("should create error with constructor", () => {
			const error = new OutputError({
				message: "Output generation failed",
				nodeId: "text-1",
			});

			expect(error._tag).toBe("OutputError");
			expect(error.message).toBe("Output generation failed");
			expect(error.nodeId).toBe("text-1");
		});

		test("should create error with helper function", () => {
			const error = outputError({
				message: "ANTML conversion failed",
				nodeId: "box-1",
			});

			expect(error._tag).toBe("OutputError");
			expect(error.message).toBe("ANTML conversion failed");
			expect(error.nodeId).toBe("box-1");
		});

		test("should include cause when provided", () => {
			const cause = new Error("Buffer error");
			const error = outputError({
				message: "Output buffer generation failed",
				cause,
			});

			expect(error.cause).toBe(cause);
		});

		test("should work without nodeId", () => {
			const error = outputError({
				message: "General output error",
			});

			expect(error.nodeId).toBeUndefined();
		});

		test("should work in Effect chains", async () => {
			const program = Effect.fail(
				outputError({ message: "Output error" })
			).pipe(
				Effect.catchTag("OutputError", (err) =>
					Effect.succeed(`Recovered: ${err.message}`)
				)
			);

			const result = await Effect.runPromise(program);
			expect(result).toBe("Recovered: Output error");
		});
	});

	describe("FocusError", () => {
		test("should create error with constructor", () => {
			const error = new FocusError({
				message: "Focus target not found",
				nodeId: "input-1",
			});

			expect(error._tag).toBe("FocusError");
			expect(error.message).toBe("Focus target not found");
			expect(error.nodeId).toBe("input-1");
		});

		test("should create error with helper function", () => {
			const error = focusError({
				message: "Invalid focus navigation",
				nodeId: "button-1",
			});

			expect(error._tag).toBe("FocusError");
			expect(error.message).toBe("Invalid focus navigation");
			expect(error.nodeId).toBe("button-1");
		});

		test("should work without nodeId", () => {
			const error = focusError({
				message: "Focus state inconsistency",
			});

			expect(error.nodeId).toBeUndefined();
		});

		test("should not have cause property", () => {
			const error = focusError({
				message: "Test error",
			});

			// TypeScript would error if we tried to access cause
			expect("cause" in error).toBe(false);
		});

		test("should work in Effect chains", async () => {
			const program = Effect.fail(focusError({ message: "Focus error" })).pipe(
				Effect.catchTag("FocusError", () => Effect.succeed("handled"))
			);

			const result = await Effect.runPromise(program);
			expect(result).toBe("handled");
		});
	});

	describe("InkError (Union Type)", () => {
		test("should accept RenderError", () => {
			const error: InkError = renderError({ message: "Test" });
			expect(error._tag).toBe("RenderError");
		});

		test("should accept LayoutError", () => {
			const error: InkError = layoutError({ message: "Test" });
			expect(error._tag).toBe("LayoutError");
		});

		test("should accept TerminalError", () => {
			const error: InkError = terminalError({ message: "Test" });
			expect(error._tag).toBe("TerminalError");
		});

		test("should accept InputError", () => {
			const error: InkError = inputError({ message: "Test" });
			expect(error._tag).toBe("InputError");
		});

		test("should accept OutputError", () => {
			const error: InkError = outputError({ message: "Test" });
			expect(error._tag).toBe("OutputError");
		});

		test("should accept FocusError", () => {
			const error: InkError = focusError({ message: "Test" });
			expect(error._tag).toBe("FocusError");
		});

		test("should support type-based discrimination", () => {
			const errors: InkError[] = [
				renderError({ message: "Render" }),
				layoutError({ message: "Layout" }),
				terminalError({ message: "Terminal" }),
				inputError({ message: "Input" }),
				outputError({ message: "Output" }),
				focusError({ message: "Focus" }),
			];

			const renderErrors = errors.filter((e) => e._tag === "RenderError");
			const layoutErrors = errors.filter((e) => e._tag === "LayoutError");
			const terminalErrors = errors.filter((e) => e._tag === "TerminalError");
			const inputErrors = errors.filter((e) => e._tag === "InputError");
			const outputErrors = errors.filter((e) => e._tag === "OutputError");
			const focusErrors = errors.filter((e) => e._tag === "FocusError");

			expect(renderErrors.length).toBe(1);
			expect(layoutErrors.length).toBe(1);
			expect(terminalErrors.length).toBe(1);
			expect(inputErrors.length).toBe(1);
			expect(outputErrors.length).toBe(1);
			expect(focusErrors.length).toBe(1);
		});

		test("should support exhaustive pattern matching", () => {
			const handleError = (error: InkError): string => {
				switch (error._tag) {
					case "RenderError":
						return `Render: ${error.message}`;
					case "LayoutError":
						return `Layout: ${error.message}`;
					case "TerminalError":
						return `Terminal: ${error.message}`;
					case "InputError":
						return `Input: ${error.message}`;
					case "OutputError":
						return `Output: ${error.message}`;
					case "FocusError":
						return `Focus: ${error.message}`;
				}
			};

			expect(handleError(renderError({ message: "test" }))).toBe(
				"Render: test"
			);
			expect(handleError(layoutError({ message: "test" }))).toBe(
				"Layout: test"
			);
			expect(handleError(terminalError({ message: "test" }))).toBe(
				"Terminal: test"
			);
			expect(handleError(inputError({ message: "test" }))).toBe("Input: test");
			expect(handleError(outputError({ message: "test" }))).toBe(
				"Output: test"
			);
			expect(handleError(focusError({ message: "test" }))).toBe("Focus: test");
		});
	});

	describe("Effect Integration", () => {
		test("should work with Effect.catchTags for multiple error types", async () => {
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

			const result1 = await Effect.runPromise(program("render"));
			const result2 = await Effect.runPromise(program("layout"));

			expect(result1).toBe("Render: Render failed");
			expect(result2).toBe("Layout: Layout failed");
		});

		test("should capture error in Either", async () => {
			const program = Effect.fail(renderError({ message: "Test error" }));

			const result = await Effect.runPromise(Effect.either(program));

			expect(Either.isLeft(result)).toBe(true);
			if (Either.isLeft(result)) {
				expect(result.left._tag).toBe("RenderError");
				expect(result.left.message).toBe("Test error");
			}
		});

		test("should support error transformation", async () => {
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

		test("should support error chaining with cause", async () => {
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

		test("should work with Effect.gen", async () => {
			const program = Effect.gen(function* () {
				// Simulate some work
				const value = yield* Effect.succeed(42);

				// Fail with error
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
				expect(result.left.message).toBe("Value too large");
			}
		});
	});

	describe("Error Serialization", () => {
		test("should serialize RenderError", () => {
			const error = renderError({
				message: "Test error",
				nodeId: "node-1",
			});

			// Data.TaggedError provides toJSON
			const serialized = JSON.parse(JSON.stringify(error));

			expect(serialized._tag).toBe("RenderError");
			expect(serialized.message).toBe("Test error");
			expect(serialized.nodeId).toBe("node-1");
		});

		test("should serialize error with cause", () => {
			const cause = new Error("Original");
			const error = layoutError({
				message: "Layout failed",
				cause,
			});

			// Serialize (cause might be Error object)
			const serialized = JSON.parse(JSON.stringify(error));

			expect(serialized._tag).toBe("LayoutError");
			expect(serialized.message).toBe("Layout failed");
		});

		test("should serialize all error types", () => {
			const errors: InkError[] = [
				renderError({ message: "Render" }),
				layoutError({ message: "Layout" }),
				terminalError({ message: "Terminal" }),
				inputError({ message: "Input" }),
				outputError({ message: "Output" }),
				focusError({ message: "Focus" }),
			];

			const serialized = JSON.parse(JSON.stringify(errors));

			expect(serialized[0]._tag).toBe("RenderError");
			expect(serialized[1]._tag).toBe("LayoutError");
			expect(serialized[2]._tag).toBe("TerminalError");
			expect(serialized[3]._tag).toBe("InputError");
			expect(serialized[4]._tag).toBe("OutputError");
			expect(serialized[5]._tag).toBe("FocusError");
		});
	});

	describe("Type Safety", () => {
		test("should enforce readonly properties", () => {
			const error = renderError({ message: "Test" });

			// TypeScript would error if we tried to modify properties
			// These tests just verify the values are accessible
			expect(error._tag).toBe("RenderError");
			expect(error.message).toBe("Test");
		});

		test("should support optional properties", () => {
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

		test("should maintain type information through Effect chains", async () => {
			const program = Effect.fail(renderError({ message: "Test" })).pipe(
				Effect.catchTag("RenderError", (err) => {
					// TypeScript knows err is RenderError
					// Has access to nodeId property
					const nodeId: string | undefined = err.nodeId;
					return Effect.succeed(nodeId ?? "no-node");
				})
			);

			const result = await Effect.runPromise(program);
			expect(result).toBe("no-node");
		});
	});

	describe("Edge Cases", () => {
		test("should handle empty message", () => {
			const error = renderError({ message: "" });
			expect(error.message).toBe("");
		});

		test("should handle long messages", () => {
			const longMessage = "x".repeat(1000);
			const error = layoutError({ message: longMessage });
			expect(error.message).toBe(longMessage);
		});

		test("should handle special characters in message", () => {
			const message = 'Test "quotes" and \n newlines \t tabs';
			const error = terminalError({ message });
			expect(error.message).toBe(message);
		});

		test("should handle null as cause", () => {
			const error = inputError({ message: "Test", cause: null });
			expect(error.cause).toBeNull();
		});

		test("should handle undefined explicitly", () => {
			const error = outputError({
				message: "Test",
				cause: undefined,
				nodeId: undefined,
			});
			expect(error.cause).toBeUndefined();
			expect(error.nodeId).toBeUndefined();
		});
	});
});
