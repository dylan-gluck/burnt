/**
 * LoggerService - Provides structured logging using Effect Service/Layer pattern
 *
 * This service demonstrates:
 * - Service with dependencies (depends on ConfigService)
 * - Layer composition
 * - Structured logging with different log levels
 * - Effect-based logging operations
 */

import { Context, Effect, Layer } from "effect";
import { type Config, ConfigService } from "./ConfigService.ts";

// Define log level hierarchy
const LOG_LEVELS = {
	debug: 0,
	info: 1,
	warn: 2,
	error: 3,
} as const;

// Define the LoggerService interface
export interface LoggerService {
	readonly debug: (message: string, data?: unknown) => Effect.Effect<void>;
	readonly info: (message: string, data?: unknown) => Effect.Effect<void>;
	readonly warn: (message: string, data?: unknown) => Effect.Effect<void>;
	readonly error: (message: string, data?: unknown) => Effect.Effect<void>;
}

// Create a Context.Tag for the service
export const LoggerService = Context.GenericTag<LoggerService>(
	"@services/LoggerService",
);

// Helper to format log messages with timestamp and level
const formatLog = (level: string, message: string, data?: unknown): string => {
	const timestamp = new Date().toISOString();
	const baseMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

	if (data !== undefined) {
		return `${baseMessage}\n${JSON.stringify(data, null, 2)}`;
	}

	return baseMessage;
};

// Create the live implementation Layer with ConfigService dependency
export const LoggerServiceLive = Layer.effect(
	LoggerService,
	Effect.gen(function* () {
		// Access the ConfigService dependency
		const configService = yield* ConfigService;
		const configLogLevel = configService.getLogLevel();
		const currentLogLevel = LOG_LEVELS[configLogLevel];

		// Helper to check if a log level should be logged
		const shouldLog = (level: Config["logLevel"]): boolean => {
			return LOG_LEVELS[level] >= currentLogLevel;
		};

		// Return the service implementation
		return {
			debug: (message: string, data?: unknown) =>
				Effect.sync(() => {
					if (shouldLog("debug")) {
						console.log(formatLog("debug", message, data));
					}
				}),

			info: (message: string, data?: unknown) =>
				Effect.sync(() => {
					if (shouldLog("info")) {
						console.log(formatLog("info", message, data));
					}
				}),

			warn: (message: string, data?: unknown) =>
				Effect.sync(() => {
					if (shouldLog("warn")) {
						console.warn(formatLog("warn", message, data));
					}
				}),

			error: (message: string, data?: unknown) =>
				Effect.sync(() => {
					if (shouldLog("error")) {
						console.error(formatLog("error", message, data));
					}
				}),
		};
	}),
);

// Create a test implementation Layer for testing
export const LoggerServiceTest = Layer.succeed(LoggerService, {
	debug: (_message: string, _data?: unknown) =>
		Effect.sync(() => {
			/* silent in tests */
		}),
	info: (_message: string, _data?: unknown) =>
		Effect.sync(() => {
			/* silent in tests */
		}),
	warn: (_message: string, _data?: unknown) =>
		Effect.sync(() => {
			/* silent in tests */
		}),
	error: (_message: string, _data?: unknown) =>
		Effect.sync(() => {
			/* silent in tests */
		}),
});
