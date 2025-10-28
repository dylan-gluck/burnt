/**
 * Terminal Output Types for Ink Port
 *
 * This module defines the terminal output structures including output buffers,
 * styled text segments, ANTML output, and output diffing for efficient rendering.
 *
 * All types follow the DATA_MODEL.md specification (Section 3: Terminal Output Data Structures)
 */

import type { RGBColor } from "./nodes.js";

// ============================================================================
// Output Buffer
// ============================================================================

/**
 * Output buffer representing terminal content as lines of styled segments
 *
 * This structure represents the complete terminal output before rendering to ANTML.
 */
export interface OutputBuffer {
	/** Array of terminal lines, each containing styled segments */
	lines: OutputLine[];
}

/**
 * Single line of terminal output
 *
 * Each line contains an array of styled text segments that make up the line content.
 */
export interface OutputLine {
	/** Styled text segments that compose this line */
	segments: OutputSegment[];
}

/**
 * Text segment with associated styling
 *
 * The fundamental unit of terminal output: text content with ANSI styling applied.
 */
export interface OutputSegment {
	/** Text content to display */
	text: string;

	/** ANSI styling to apply to the text */
	style: TerminalStyle;
}

// ============================================================================
// Terminal Styling
// ============================================================================

/**
 * ANSI terminal styling information
 *
 * Defines visual styling for text segments including colors and text decorations.
 * All style properties are optional to support partial styling.
 */
export interface TerminalStyle {
	/** Text color as RGB (supports true color terminals) */
	foreground?: RGBColor;

	/** Background color as RGB (supports true color terminals) */
	background?: RGBColor;

	/** Bold/bright text */
	bold?: boolean;

	/** Italic text (not supported on all terminals) */
	italic?: boolean;

	/** Underlined text */
	underline?: boolean;

	/** Strikethrough text (not supported on all terminals) */
	strikethrough?: boolean;

	/** Dimmed/faint text */
	dim?: boolean;

	/** Inverse/reverse video (swap foreground and background) */
	inverse?: boolean;
}

// ============================================================================
// ANTML Output
// ============================================================================

/**
 * ANTML (ANSI Terminal Markup Language) output
 *
 * Represents the final output that will be written to the terminal, containing
 * ANSI escape sequences and raw text content.
 */
export interface ANTMLOutput {
	/** Type discriminator for ANTML output */
	type: "antml";

	/** Raw ANTML content with escape sequences and text */
	content: string;
}

/**
 * ANTML command for terminal control operations
 *
 * Represents structured commands for terminal control (clear, flush, exit, etc.)
 * that are not part of the regular text output.
 */
export interface ANTMLCommand {
	/** Command type discriminator */
	type: "clear" | "flush" | "exit";

	/** Optional command payload (command-specific data) */
	payload?: unknown;
}

// ============================================================================
// Output Diffing
// ============================================================================

/**
 * Output diff representing changes between two output buffers
 *
 * Used for efficient incremental rendering by computing only the changed lines.
 */
export interface OutputDiff {
	/** Array of diff operations to transform previous buffer into current */
	operations: OutputOperation[];
}

/**
 * Single diff operation for a line in the output buffer
 *
 * Represents an atomic change to the output (insert, delete, or update a line).
 */
export interface OutputOperation {
	/** Operation type discriminator */
	type: "insert" | "delete" | "update";

	/** Line index where the operation applies */
	lineIndex: number;

	/** Previous line content (for delete and update operations) */
	oldLine?: OutputLine;

	/** New line content (for insert and update operations) */
	newLine?: OutputLine;
}
