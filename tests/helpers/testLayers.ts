/**
 * Test utilities for Effect-based testing
 *
 * Provides generic helpers for testing Effect programs:
 * - Running Effect programs in tests
 * - Capturing results (success or failure)
 * - Providing test layers
 */

import { Effect, Layer } from "effect";
import type { Either } from "effect/Either";

/**
 * Helper to run an Effect program with a test layer
 *
 * @example
 * ```ts
 * const result = await runTestEffect(
 *   myProgram.pipe(Effect.provide(MyTestLayer))
 * )
 * ```
 */
export const runTestEffect = <A, E>(
	effect: Effect.Effect<A, E, never>
): Promise<A> => {
	return Effect.runPromise(effect);
};

/**
 * Helper to run Effect program and capture result (success or failure)
 *
 * @example
 * ```ts
 * const result = await runTestEffectWithResult(
 *   myProgram.pipe(Effect.provide(MyTestLayer))
 * )
 * if (Either.isRight(result)) {
 *   console.log("Success:", result.right)
 * } else {
 *   console.log("Error:", result.left)
 * }
 * ```
 */
export const runTestEffectWithResult = <A, E>(
	effect: Effect.Effect<A, E, never>
): Promise<Either<A, E>> => {
	return Effect.runPromise(Effect.either(effect));
};

/**
 * Helper to create a test layer from a service implementation
 *
 * @example
 * ```ts
 * const MockRendererLayer = createTestLayer(RendererService, mockRendererImpl)
 * ```
 */
export const createTestLayer = <I, S>(
	tag: import("effect/Context").Tag<I, S>,
	implementation: S
): Layer.Layer<I> => {
	return Layer.succeed(tag, implementation);
};
