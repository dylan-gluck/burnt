/**
 * Layout Types for Ink Port
 *
 * This module defines the layout calculation structures including layout information,
 * Yoga node wrappers, layout requests, and layout results.
 *
 * All types follow the DATA_MODEL.md specification (Section 2: Layout Data Structures)
 */

import type { BoxProps } from "./nodes.js";

// ============================================================================
// Layout Information
// ============================================================================

/**
 * Computed layout information from Yoga layout engine
 *
 * Contains absolute and relative positioning information after layout calculation.
 */
export interface LayoutInfo {
	/** Absolute X position in terminal */
	x: number;

	/** Absolute Y position in terminal */
	y: number;

	/** Computed width in terminal cells */
	width: number;

	/** Computed height in terminal lines */
	height: number;

	/** Relative left offset from parent */
	left: number;

	/** Relative top offset from parent */
	top: number;
}

// ============================================================================
// Yoga Node Wrapper
// ============================================================================

/**
 * Wrapper interface for Yoga layout engine nodes
 *
 * This interface abstracts the native Yoga node and provides methods for
 * layout calculation, style application, and resource cleanup.
 *
 * Note: The actual implementation will be provided by the LayoutService in Phase 3.
 */
export interface YogaNode {
	/**
	 * Trigger layout calculation for this node and its subtree
	 *
	 * @param width - Available width for layout (terminal width)
	 * @param height - Available height for layout (terminal height)
	 */
	calculate(width: number, height: number): void;

	/**
	 * Retrieve the calculated layout information after calculation
	 *
	 * @returns Computed layout with absolute and relative positioning
	 */
	getComputedLayout(): LayoutInfo;

	/**
	 * Apply flexbox styles to the Yoga node
	 *
	 * @param style - BoxProps containing flexbox and dimension properties
	 */
	setStyle(style: BoxProps): void;

	/**
	 * Cleanup Yoga resources when node is no longer needed
	 *
	 * Important: Must be called to prevent memory leaks in native Yoga bindings
	 */
	free(): void;
}

// ============================================================================
// Layout Request/Result
// ============================================================================

/**
 * Request for layout calculation
 *
 * Used to trigger layout calculation for specific nodes or the entire tree.
 */
export interface LayoutRequest {
	/** Node ID to calculate layout for */
	nodeId: string;

	/** Available terminal width for layout */
	terminalWidth: number;

	/** Available terminal height for layout */
	terminalHeight: number;

	/** Force recalculation even if cached layout exists */
	force: boolean;
}

/**
 * Result of layout calculation
 *
 * Contains the computed layout for a node and its children, along with metadata.
 */
export interface LayoutResult {
	/** Node ID that was laid out */
	nodeId: string;

	/** Computed layout information for the node */
	layout: LayoutInfo;

	/** Computed layout information for all child nodes (keyed by node ID) */
	childLayouts: Map<string, LayoutInfo>;

	/** Timestamp of layout calculation (for caching and change detection) */
	timestamp: number;
}
