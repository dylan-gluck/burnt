#!/usr/bin/env bun

/**
 * Build script for effect-bun-cli using Bun.build API
 *
 * This script bundles the application for distribution with:
 * - Source maps for debugging
 * - Minification for production
 * - Type declarations
 * - External dependencies management
 */

import { existsSync } from "node:fs";
import { mkdir, rm } from "node:fs/promises";
import { resolve } from "node:path";
import { build } from "bun";

const __dirname = import.meta.dir;
const rootDir = resolve(__dirname, "..");
const distDir = resolve(rootDir, "dist");
const srcDir = resolve(rootDir, "src");

// Environment
const isDev = process.env.NODE_ENV === "development";
const isProd = !isDev;

console.log(`Building in ${isDev ? "development" : "production"} mode...`);

// Clean dist directory
if (existsSync(distDir)) {
	console.log("Cleaning dist directory...");
	await rm(distDir, { recursive: true, force: true });
}

// Create dist directory
await mkdir(distDir, { recursive: true });

try {
	// Build configuration
	const buildConfig = {
		entrypoints: [resolve(srcDir, "index.ts")],
		outdir: distDir,
		target: "bun",
		minify: isProd,
		sourcemap: "external" as const,
		splitting: true,

		// External dependencies (not bundled - should be installed by users)
		external: [
			"react",
			"react-dom",
			"react-reconciler",
			"effect",
			"@effect/cli",
			"@effect/platform",
			"@effect/platform-node",
			"@effect/schema",
			"yoga-layout",
		],

		// Define globals for optimization
		define: {
			"process.env.NODE_ENV": JSON.stringify(
				process.env.NODE_ENV || "production"
			),
		},

		// Naming convention for output files
		naming: {
			entry: "[dir]/[name].js",
			chunk: "[name]-[hash].js",
			asset: "[name]-[hash].[ext]",
		},
	};

	console.log("Building application bundle...");
	const result = await build(buildConfig);

	if (!result.success) {
		console.error("Build failed!");
		for (const log of result.logs) {
			console.error(log);
		}
		process.exit(1);
	}

	console.log("✓ Build completed successfully!");
	console.log(`  Output: ${distDir}`);
	console.log(`  Minified: ${isProd}`);
	console.log(`  Source maps: external`);

	// Display output files
	if (result.outputs.length > 0) {
		console.log("\nOutput files:");
		for (const output of result.outputs) {
			const size = output.size ? `(${(output.size / 1024).toFixed(2)} KB)` : "";
			console.log(`  - ${output.path} ${size}`);
		}
	}

	// Type checking reminder
	console.log('\n💡 Run "bun run typecheck" to verify types');
} catch (error) {
	console.error("Build error:", error);
	process.exit(1);
}
