import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

/**
 * Vitest configuration for effect-bun-cli
 *
 * Configured for:
 * - TypeScript support
 * - Effect testing utilities integration
 * - Coverage reporting
 * - Path aliases matching tsconfig.json
 */

export default defineConfig({
	test: {
		// Environment
		environment: "node",

		// Test file patterns
		include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
		exclude: ["node_modules", "dist", "coverage"],

		// Coverage configuration
		coverage: {
			provider: "v8",
			reporter: ["text", "json", "html", "lcov"],
			include: ["src/**/*.ts", "src/**/*.tsx"],
			exclude: [
				"src/**/*.test.ts",
				"src/**/*.test.tsx",
				"src/__tests__/**",
				"src/types/**",
			],
			thresholds: {
				lines: 80,
				functions: 80,
				branches: 80,
				statements: 80,
			},
		},

		// Global test timeout
		testTimeout: 10000,

		// Setup files
		setupFiles: [],

		// Globals (optional - prefer explicit imports)
		globals: false,

		// Mock handling
		clearMocks: true,
		mockReset: true,
		restoreMocks: true,

		// Watch mode options
		watch: false,
		watchExclude: ["**/node_modules/**", "**/dist/**"],
	},

	// Path resolution matching tsconfig.json
	resolve: {
		alias: {
			"@": resolve(__dirname, "./src"),
			"@components": resolve(__dirname, "./src/components"),
			"@hooks": resolve(__dirname, "./src/hooks"),
			"@services": resolve(__dirname, "./src/services"),
			"@contexts": resolve(__dirname, "./src/contexts"),
			"@utils": resolve(__dirname, "./src/utils"),
			"@types": resolve(__dirname, "./src/types"),
		},
	},
});
