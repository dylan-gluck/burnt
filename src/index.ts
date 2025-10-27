#!/usr/bin/env bun

/**
 * Main entry point for the Effect-based CLI application
 *
 * This demonstrates:
 * - CLI execution with command parsing
 * - Layer composition and dependency injection
 * - Proper error handling and exit codes
 * - NodeRuntime.runMain for running the main program
 */

import { NodeContext, NodeRuntime } from "@effect/platform-node";
import { Effect, Layer } from "effect";
import { ConfigService, ConfigServiceLive } from "./services/ConfigService.ts";
import {
	GreetingService,
	GreetingServiceLive,
} from "./services/GreetingService.ts";
import { LoggerService, LoggerServiceLive } from "./services/LoggerService.ts";

// Compose all service layers
// LoggerService depends on ConfigService, so we use Layer.provide
// GreetingService depends on both ConfigService and LoggerService
const AppLayer = Layer.mergeAll(
	ConfigServiceLive,
	LoggerServiceLive.pipe(Layer.provide(ConfigServiceLive)),
	GreetingServiceLive.pipe(
		Layer.provide(
			Layer.mergeAll(
				ConfigServiceLive,
				LoggerServiceLive.pipe(Layer.provide(ConfigServiceLive)),
			),
		),
	),
);

// Parse CLI arguments
const parseArgs = (
	args: string[],
): {
	command: string;
	name?: string;
	time?: boolean;
} => {
	const [command = "", name = ""] = args;
	const time = args.includes("--time");
	return { command, name, time };
};

// Main program
const program = Effect.gen(function* () {
	const args = process.argv.slice(2);
	const { command, name, time } = parseArgs(args);

	// Access services
	const config = yield* ConfigService;
	const greeting = yield* GreetingService;
	const logger = yield* LoggerService;

	// Handle commands
	if (command === "version" || args.includes("--version")) {
		const appName = config.getAppName();
		const version = config.getVersion();
		const environment = config.getEnvironment();
		const versionInfo = `${appName} v${version} (${environment})`;
		console.log(versionInfo);
		yield* logger.info("Version information displayed", {
			appName,
			version,
			environment,
		});
	} else if (command === "greet" && name) {
		yield* logger.debug("Executing greet command", { name, time });
		const result = time
			? yield* greeting.greetWithTime(name)
			: yield* greeting.greet(name);
		console.log(result);
	} else {
		// Show help
		const appName = config.getAppName();
		console.log(`${appName} - A production-ready CLI built with Bun and Effect-TS

Usage:
  effect-cli greet <name> [--time]  Greet a person by name
  effect-cli version                Display version information
  effect-cli --help                 Show this help message

Examples:
  effect-cli greet Alice
  effect-cli greet Bob --time
  effect-cli version`);
	}
});

// Run the program with all layers and proper error handling
program.pipe(
	Effect.provide(AppLayer),
	Effect.provide(NodeContext.layer),
	NodeRuntime.runMain,
);
