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
 * Format and display relevant build output
 */
function displayBuildOutput(stdout: string) {
	const lines = stdout.split("\n").filter((line) => line.trim());
	for (const line of lines) {
		if (line.includes("✓") || line.includes("Output")) {
			console.log(`  ${colors.dim}${line}${colors.reset}`);
		}
	}
}

/**
 * Handle successful build
 */
function handleBuildSuccess(duration: string, stdout: string) {
	console.log(
		`${colors.green}✓ Build completed in ${duration}s${colors.reset}`
	);
	if (stdout) displayBuildOutput(stdout);
}

/**
 * Handle failed build
 */
function handleBuildFailure(stderr: string, stdout: string) {
	console.log(`${colors.red}✗ Build failed${colors.reset}`);
	if (stderr) console.error(stderr);
	if (stdout) console.log(stdout);
}

/**
 * Execute build script and capture output
 */
async function executeBuild() {
	const proc = Bun.spawn(["bun", "run", resolve(rootDir, "scripts/build.ts")], {
		cwd: rootDir,
		stdout: "pipe",
		stderr: "pipe",
	});

	const [stdout, stderr] = await Promise.all([
		new Response(proc.stdout).text(),
		new Response(proc.stderr).text(),
	]);

	await proc.exited;
	return { exitCode: proc.exitCode, stdout, stderr };
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

		const { exitCode, stdout, stderr } = await executeBuild();

		const duration = ((performance.now() - startTime) / 1000).toFixed(2);

		if (exitCode === 0) {
			handleBuildSuccess(duration, stdout);
		} else {
			handleBuildFailure(stderr, stdout);
		}

		return exitCode === 0;
	} catch (error) {
		console.error(`${colors.red}✗ Build error:${colors.reset}`, error);
		return false;
	} finally {
		isBuilding = false;

		if (shouldRebuild) {
			console.log(
				`${colors.yellow}⟳ Changes detected, rebuilding...${colors.reset}\n`
			);
			await runBuild();
		}
	}
}

/**
 * Check if file should trigger rebuild
 */
function shouldRebuildForFile(filename: string): boolean {
	if (!filename.endsWith(".ts") && !filename.endsWith(".tsx")) return false;
	if (filename.includes(".test.")) return false;
	return true;
}

/**
 * Handle file change event
 */
async function handleFileChange(filename: string | null) {
	if (!filename || !shouldRebuildForFile(filename)) return;

	console.log(
		`${colors.yellow}📝 File changed:${colors.reset} ${colors.dim}${filename}${colors.reset}`
	);
	await runBuild();
	console.log(); // Empty line for readability
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
			await handleFileChange(filename);
		}
	);

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
