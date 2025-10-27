/**
 * GreetingService - Example business logic service with dependencies
 *
 * This service demonstrates:
 * - Service with multiple dependencies (ConfigService, LoggerService)
 * - Business logic using Effect operations
 * - Error handling with typed errors
 * - Effect.gen for readable sequential code
 */

import { Context, Data, Effect, Layer } from "effect";
import { ConfigService } from "./ConfigService.ts";
import { LoggerService } from "./LoggerService.ts";

// Define typed errors for this service
export class GreetingError extends Data.TaggedError("GreetingError")<{
	readonly message: string;
}> {}

// Define the GreetingService interface
export interface GreetingService {
	readonly greet: (name: string) => Effect.Effect<string, GreetingError, never>;
	readonly greetWithTime: (
		name: string,
	) => Effect.Effect<string, GreetingError, never>;
}

// Create a Context.Tag for the service
export const GreetingService = Context.GenericTag<GreetingService>(
	"@services/GreetingService",
);

// Create the live implementation Layer with dependencies
export const GreetingServiceLive = Layer.effect(
	GreetingService,
	Effect.gen(function* () {
		// Access service dependencies
		const config = yield* ConfigService;
		const logger = yield* LoggerService;

		// Helper function to validate name
		const validateName = (
			name: string,
		): Effect.Effect<string, GreetingError> => {
			if (name.trim().length === 0) {
				return Effect.fail(
					new GreetingError({ message: "Name cannot be empty" }),
				);
			}
			if (name.length > 50) {
				return Effect.fail(
					new GreetingError({
						message: "Name is too long (max 50 characters)",
					}),
				);
			}
			return Effect.succeed(name.trim());
		};

		// Helper function to get time-based greeting prefix
		const getTimeBasedPrefix = (): string => {
			const hour = new Date().getHours();
			if (hour < 12) return "Good morning";
			if (hour < 18) return "Good afternoon";
			return "Good evening";
		};

		// Return the service implementation
		return {
			greet: (name: string) =>
				Effect.gen(function* () {
					// Validate the name
					const validName = yield* validateName(name);

					// Log the greeting operation
					yield* logger.info("Creating greeting", { name: validName });

					// Create the greeting message
					const appName = config.getAppName();
					const greeting = `Hello, ${validName}! Welcome to ${appName}.`;

					// Log success
					yield* logger.debug("Greeting created successfully", { greeting });

					return greeting;
				}),

			greetWithTime: (name: string) =>
				Effect.gen(function* () {
					// Validate the name
					const validName = yield* validateName(name);

					// Log the greeting operation
					yield* logger.info("Creating time-based greeting", {
						name: validName,
					});

					// Get time-based prefix
					const prefix = getTimeBasedPrefix();

					// Create the greeting message
					const greeting = `${prefix}, ${validName}!`;

					// Log success
					yield* logger.debug("Time-based greeting created", { greeting });

					return greeting;
				}),
		};
	}),
);

// Create a test implementation Layer for testing
export const GreetingServiceTest = Layer.succeed(GreetingService, {
	greet: (name: string) => {
		if (name.trim().length === 0) {
			return Effect.fail(
				new GreetingError({ message: "Name cannot be empty" }),
			);
		}
		return Effect.succeed(`Hello, ${name}! Welcome to test-app.`);
	},
	greetWithTime: (name: string) => {
		if (name.trim().length === 0) {
			return Effect.fail(
				new GreetingError({ message: "Name cannot be empty" }),
			);
		}
		return Effect.succeed(`Good morning, ${name}!`);
	},
});
