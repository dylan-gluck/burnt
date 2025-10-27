/**
 * ConfigService - Provides application configuration using Effect Service/Layer pattern
 *
 * This service demonstrates:
 * - Service definition using Context.Tag
 * - Layer creation with validation
 * - Schema-based configuration validation
 * - Environment variable support
 */

import { Schema } from "@effect/schema";
import { Context, Effect, Layer } from "effect";

// Define the configuration schema with validation
export const ConfigSchema = Schema.Struct({
	appName: Schema.String,
	version: Schema.String,
	environment: Schema.Literal("development", "production", "test"),
	logLevel: Schema.Literal("debug", "info", "warn", "error"),
});

// Infer TypeScript type from schema
export type Config = Schema.Schema.Type<typeof ConfigSchema>;

// Define the ConfigService interface
export interface ConfigService {
	readonly config: Config;
	readonly getAppName: () => string;
	readonly getVersion: () => string;
	readonly getEnvironment: () => Config["environment"];
	readonly getLogLevel: () => Config["logLevel"];
}

// Create a Context.Tag for the service (enables dependency injection)
export const ConfigService = Context.GenericTag<ConfigService>(
	"@services/ConfigService",
);

// Create the live implementation Layer
export const ConfigServiceLive = Layer.effect(
	ConfigService,
	Effect.gen(function* () {
		// Parse and validate configuration
		const rawEnv = process.env.NODE_ENV;
		const environment: Config["environment"] =
			rawEnv === "production" || rawEnv === "test" ? rawEnv : "development";

		const rawLogLevel = process.env.LOG_LEVEL;
		const logLevel: Config["logLevel"] =
			rawLogLevel === "debug" ||
			rawLogLevel === "info" ||
			rawLogLevel === "warn" ||
			rawLogLevel === "error"
				? rawLogLevel
				: "info";

		const config = yield* Schema.decode(ConfigSchema)({
			appName: "effect-cli",
			version: "1.0.0",
			environment,
			logLevel,
		});

		// Return the service implementation
		return {
			config,
			getAppName: () => config.appName,
			getVersion: () => config.version,
			getEnvironment: () => config.environment,
			getLogLevel: () => config.logLevel,
		};
	}),
);

// Create a test implementation Layer for testing
export const ConfigServiceTest = Layer.succeed(ConfigService, {
	config: {
		appName: "test-app",
		version: "0.0.0",
		environment: "test",
		logLevel: "debug",
	},
	getAppName: () => "test-app",
	getVersion: () => "0.0.0",
	getEnvironment: () => "test",
	getLogLevel: () => "debug",
});
