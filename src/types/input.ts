/**
 * Input Event Types for Ink Port
 *
 * This module defines input handling structures including keyboard events,
 * mouse events, terminal resize events, and focus management.
 *
 * All types follow the DATA_MODEL.md specification (Section 4: Input Data Structures)
 */

// ============================================================================
// Input Events
// ============================================================================

/**
 * Union type of all possible input events
 *
 * Discriminated union for type-safe event handling based on event type.
 */
export type InputEvent = KeyPress | MouseEvent | ResizeEvent;

/**
 * Keyboard key press event
 *
 * Represents a keyboard input with parsed key information and modifiers.
 */
export interface KeyPress {
	/** Event type discriminator */
	type: "keypress";

	/** Parsed key information */
	key: Key;

	/** Keyboard modifiers pressed during the event */
	modifiers: KeyModifiers;
}

/**
 * Parsed keyboard key information
 *
 * Contains the key name, raw escape sequence, and individual modifier flags.
 */
export interface Key {
	/** Key name (e.g., "a", "enter", "up", "escape", "tab") */
	name: string;

	/** Raw escape sequence from terminal input */
	sequence: string;

	/** Control key pressed (Ctrl on Windows/Linux, Cmd on macOS) */
	ctrl: boolean;

	/** Meta key pressed (Alt on Windows/Linux, Option on macOS) */
	meta: boolean;

	/** Shift key pressed */
	shift: boolean;
}

/**
 * Keyboard modifier keys state
 *
 * Separate interface for modifier state to enable querying modifier combinations.
 */
export interface KeyModifiers {
	/** Control key pressed */
	ctrl: boolean;

	/** Alt key pressed (Windows/Linux) or Option key (macOS) */
	alt: boolean;

	/** Shift key pressed */
	shift: boolean;

	/** Meta key pressed (Windows key on Windows, Command on macOS) */
	meta: boolean;
}

// ============================================================================
// Mouse Events
// ============================================================================

/**
 * Mouse input event
 *
 * Represents mouse interactions in the terminal (if supported by terminal and enabled).
 */
export interface MouseEvent {
	/** Event type discriminator */
	type: "mouse";

	/** Terminal column (0-based) */
	x: number;

	/** Terminal row (0-based) */
	y: number;

	/** Mouse button involved in the event */
	button: "left" | "right" | "middle" | "wheelUp" | "wheelDown";

	/** Mouse action type */
	action: "press" | "release" | "move";
}

// ============================================================================
// Terminal Resize Events
// ============================================================================

/**
 * Terminal resize event
 *
 * Emitted when the terminal window is resized, triggering layout recalculation.
 */
export interface ResizeEvent {
	/** Event type discriminator */
	type: "resize";

	/** New terminal width in columns */
	width: number;

	/** New terminal height in rows */
	height: number;
}

// ============================================================================
// Focus Management
// ============================================================================

/**
 * Focus state for interactive components
 *
 * Tracks which node currently has focus and maintains focus history for restoration.
 */
export interface FocusState {
	/** ID of the currently focused node, or null if no focus */
	focusedNodeId: string | null;

	/** Stack of previously focused node IDs (for focus restoration) */
	focusHistory: string[];
}

/**
 * Focus manager interface for managing focus state
 *
 * Provides methods for querying and manipulating focus within the render tree.
 * Note: The actual implementation will be provided by the FocusService in Phase 4.
 */
export interface FocusManager {
	/**
	 * Get the currently focused node ID
	 *
	 * @returns Node ID of focused node, or null if no node has focus
	 */
	getFocusedNode(): string | null;

	/**
	 * Set focus to a specific node
	 *
	 * @param nodeId - ID of node to focus
	 */
	setFocus(nodeId: string): void;

	/**
	 * Move focus to the next focusable node
	 *
	 * Cycles through focusable nodes in tree order.
	 */
	moveFocusNext(): void;

	/**
	 * Move focus to the previous focusable node
	 *
	 * Cycles through focusable nodes in reverse tree order.
	 */
	moveFocusPrevious(): void;

	/**
	 * Clear focus from all nodes
	 *
	 * Removes focus state entirely (no node will be focused).
	 */
	clearFocus(): void;
}
