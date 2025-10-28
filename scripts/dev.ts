#!/usr/bin/env bun

/**
 * Development watch mode script
 *
 * Features:
 * - Watches src/ directory for changes
 * - Rebuilds on file changes
 * - Clears console on rebuild
 * - Displays error messages clearly
 * - Fast incremental rebuilds with Bun
 */

import { watch } from "node:fs";
import { resolve } from "node:path";

const __dirname = import.meta.dir;
const rootDir = resolve(__dirname, "..");
const srcDir = resolve(rootDir, "src");

// Track if a build is currently running
let isBuilding = false;
let shouldRebuild = false;

// ANSI color codes for better output
const colors = {
	reset: "\x1b[0m",
	cyan: "\x1b[36m",
	green: "\x1b[32m",
	yellow: "\x1b[33m",
	red: "\x1b[31m",
	dim: "\x1b[2m",
};

/**
 * Clear console for cleaner output
 */
function clearConsole() {
	console.clear();
	console.log(
		`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`
	);
	console.log(
		`${colors.cyan}  Effect Bun CLI - Development Mode${colors.reset}`
	);
	console.log(
		`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`
	);
}

/**
 * Run build process
 */
async function runBuild(): Promise<boolean> {
	if (isBuilding) {
		shouldRebuild = true;
		return false;
	}

	isBuilding = true;
	shouldRebuild = false;

	try {
		console.log(`${colors.yellow}⚡ Building...${colors.reset}`);
		const startTime = performance.now();

		const proc = Bun.spawn(
			["bun", "run", resolve(rootDir, "scripts/build.ts")],
			{
				cwd: rootDir,
				stdout: "pipe",
				stderr: "pipe",
			}
		);

		const [stdout, stderr] = await Promise.all([
			new Response(proc.stdout).text(),
			new Response(proc.stderr).text(),
		]);

		await proc.exited;

		const endTime = performance.now();
		const duration = ((endTime - startTime) / 1000).toFixed(2);

		if (proc.exitCode === 0) {
			console.log(
				`${colors.green}✓ Build completed in ${duration}s${colors.reset}`
			);

			// Show relevant build output
			if (stdout) {
				const lines = stdout.split("\n").filter((line) => line.trim());
				for (const line of lines) {
					if (line.includes("✓") || line.includes("Output")) {
						console.log(`  ${colors.dim}${line}${colors.reset}`);
					}
				}
			}
		} else {
			console.log(`${colors.red}✗ Build failed${colors.reset}`);
			if (stderr) {
				console.error(stderr);
			}
			if (stdout) {
				console.log(stdout);
			}
		}

		return proc.exitCode === 0;
	} catch (error) {
		console.error(`${colors.red}✗ Build error:${colors.reset}`, error);
		return false;
	} finally {
		isBuilding = false;

		// If a change occurred during build, rebuild
		if (shouldRebuild) {
			console.log(
				`${colors.yellow}⟳ Changes detected, rebuilding...${colors.reset}\n`
			);
			await runBuild();
		}
	}
}

/**
 * Watch for file changes
 */
function watchFiles() {
	console.log(
		`${colors.cyan}👀 Watching for changes in ${colors.reset}${colors.dim}src/${colors.reset}\n`
	);

	const watcher = watch(
		srcDir,
		{ recursive: true },
		async (_eventType, filename) => {
			if (!filename) return;

			// Only watch TypeScript files
			if (!filename.endsWith(".ts") && !filename.endsWith(".tsx")) {
				return;
			}

			// Skip test files for rebuild (they don't affect build output)
			if (filename.includes(".test.")) {
				return;
			}

			console.log(
				`${colors.yellow}📝 File changed:${colors.reset} ${colors.dim}${filename}${colors.reset}`
			);
			await runBuild();
			console.log(); // Empty line for readability
		}
	);

	// Handle process termination
	const cleanup = () => {
		console.log(`\n${colors.yellow}Stopping watch mode...${colors.reset}`);
		watcher.close();
		process.exit(0);
	};

	process.on("SIGINT", cleanup);
	process.on("SIGTERM", cleanup);
}

// Main execution
async function main() {
	clearConsole();

	// Initial build
	console.log(`${colors.cyan}Running initial build...${colors.reset}\n`);
	await runBuild();
	console.log();

	// Start watching
	watchFiles();
}

// Run
main().catch((error) => {
	console.error(`${colors.red}Fatal error:${colors.reset}`, error);
	process.exit(1);
});
