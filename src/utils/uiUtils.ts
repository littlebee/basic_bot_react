/**
 * UI Event Utilities
 *
 * This module provides type guards and utilities for handling UI events
 * in React components.
 *
 * @module uiUtils
 */

/**
 * Type guard to determine if an event is a touch event.
 *
 * Use this to distinguish between touch and mouse events in components
 * that support both input methods. Enables proper handling of event
 * properties specific to touch or mouse interactions.
 *
 * @param e - React touch or mouse event
 * @returns True if the event is a touch event
 *
 * @example
 * ```typescript
 * function handleInteraction(e: React.TouchEvent | React.MouseEvent) {
 *   if (isTouchEvent(e)) {
 *     const x = e.touches[0].clientX;
 *     const y = e.touches[0].clientY;
 *   } else {
 *     const x = e.clientX;
 *     const y = e.clientY;
 *   }
 * }
 * ```
 */
export function isTouchEvent(
    e: React.TouchEvent | React.MouseEvent
): e is React.TouchEvent {
    return e.nativeEvent instanceof TouchEvent;
}
