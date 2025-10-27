/**
 * CLI Commands - Define CLI commands using @effect/cli
 *
 * This module demonstrates:
 * - Command definition with @effect/cli
 * - Argument and option parsing
 * - Command handlers using Effect.gen
 * - Integration with services
 */

import { Args, Command, Options } from "@effect/cli";
import { Effect } from "effect";
import { ConfigService } from "../services/ConfigService.ts";
import { GreetingService } from "../services/GreetingService.ts";
import { LoggerService } from "../services/LoggerService.ts";

// Define the 'greet' command
// Usage: greet <name> [--time]
export const greetCommand = Command.make(
	"greet",
	{
		// Define positional argument: name
		name: Args.text({ name: "name" }).pipe(
			Args.withDescription("The name to greet"),
		),
		// Define optional flag: --time
		time: Options.boolean("time").pipe(
			Options.withDescription(
				"Include time-based greeting (Good morning, etc.)",
			),
			Options.withDefault(false),
		),
	},
	({ name, time }) =>
		Effect.gen(function* () {
			// Access services
			const greetingService = yield* GreetingService;
			const logger = yield* LoggerService;

			// Log command execution
			yield* logger.debug("Executing greet command", { name, time });

			// Execute greeting based on options
			const greeting = time
				? yield* greetingService.greetWithTime(name)
				: yield* greetingService.greet(name);

			// Output the greeting
			console.log(greeting);

			return greeting;
		}),
).pipe(Command.withDescription("Greet a person by name"));

// Define the 'version' command
// Usage: version
export const versionCommand = Command.make("version", {}, () =>
	Effect.gen(function* () {
		// Access services
		const config = yield* ConfigService;
		const logger = yield* LoggerService;

		// Log command execution
		yield* logger.debug("Executing version command");

		// Get version info
		const appName = config.getAppName();
		const version = config.getVersion();
		const environment = config.getEnvironment();

		// Output version information
		const versionInfo = `${appName} v${version} (${environment})`;
		console.log(versionInfo);

		// Log additional details
		yield* logger.info("Version information displayed", {
			appName,
			version,
			environment,
		});

		return versionInfo;
	}),
).pipe(Command.withDescription("Display version information"));

// Combine commands into a single CLI
export const cli = Command.make("effect-cli").pipe(
	Command.withDescription(
		"A production-ready CLI built with Bun and Effect-TS",
	),
	Command.withSubcommands([greetCommand, versionCommand]),
);
