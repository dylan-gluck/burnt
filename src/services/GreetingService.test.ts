/**
 * Tests for GreetingService demonstrating Effect testing patterns
 *
 * This demonstrates:
 * - Testing Effect-based services
 * - Using test layers for mocking dependencies
 * - Testing error cases with typed errors
 * - Effect.runPromise for async test execution
 */

import { describe, expect, test } from "bun:test";
import { Effect, Layer } from "effect";
import { ConfigServiceTest } from "./ConfigService.ts";
import {
	GreetingError,
	GreetingService,
	GreetingServiceLive,
} from "./GreetingService.ts";
import { LoggerServiceTest } from "./LoggerService.ts";

// Create a test layer with all dependencies
const TestLayer = Layer.mergeAll(
	ConfigServiceTest,
	LoggerServiceTest,
	GreetingServiceLive.pipe(
		Layer.provide(Layer.mergeAll(ConfigServiceTest, LoggerServiceTest)),
	),
);

describe("GreetingService", () => {
	describe("greet", () => {
		test("should greet a valid name", async () => {
			const program = Effect.gen(function* () {
				const service = yield* GreetingService;
				const result = yield* service.greet("Alice");
				return result;
			});

			const result = await Effect.runPromise(
				program.pipe(Effect.provide(TestLayer)),
			);

			expect(result).toContain("Alice");
			expect(result).toContain("test-app");
		});

		test("should fail with empty name", async () => {
			const program = Effect.gen(function* () {
				const service = yield* GreetingService;
				const result = yield* service.greet("");
				return result;
			});

			const result = await Effect.runPromise(
				program.pipe(
					Effect.provide(TestLayer),
					Effect.flip, // Convert errors to success and success to errors
				),
			);

			expect(result).toBeInstanceOf(GreetingError);
			expect(result.message).toContain("empty");
		});

		test("should fail with name that is too long", async () => {
			const longName = "a".repeat(51);
			const program = Effect.gen(function* () {
				const service = yield* GreetingService;
				const result = yield* service.greet(longName);
				return result;
			});

			const result = await Effect.runPromise(
				program.pipe(Effect.provide(TestLayer), Effect.flip),
			);

			expect(result).toBeInstanceOf(GreetingError);
			expect(result.message).toContain("too long");
		});

		test("should trim whitespace from name", async () => {
			const program = Effect.gen(function* () {
				const service = yield* GreetingService;
				const result = yield* service.greet("  Bob  ");
				return result;
			});

			const result = await Effect.runPromise(
				program.pipe(Effect.provide(TestLayer)),
			);

			expect(result).toContain("Bob");
			expect(result).not.toContain("  Bob  ");
		});
	});

	describe("greetWithTime", () => {
		test("should greet with time-based prefix", async () => {
			const program = Effect.gen(function* () {
				const service = yield* GreetingService;
				const result = yield* service.greetWithTime("Charlie");
				return result;
			});

			const result = await Effect.runPromise(
				program.pipe(Effect.provide(TestLayer)),
			);

			expect(result).toContain("Charlie");
			// Should contain one of the time-based greetings
			const hasTimeGreeting =
				result.includes("Good morning") ||
				result.includes("Good afternoon") ||
				result.includes("Good evening");
			expect(hasTimeGreeting).toBe(true);
		});

		test("should fail with empty name", async () => {
			const program = Effect.gen(function* () {
				const service = yield* GreetingService;
				const result = yield* service.greetWithTime("");
				return result;
			});

			const result = await Effect.runPromise(
				program.pipe(Effect.provide(TestLayer), Effect.flip),
			);

			expect(result).toBeInstanceOf(GreetingError);
			expect(result.message).toContain("empty");
		});
	});
});
