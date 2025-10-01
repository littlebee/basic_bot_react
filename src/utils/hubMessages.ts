/**
 * Hub Message Utilities
 *
 * This module provides convenience functions for sending messages to the
 * basic_bot central hub via WebSocket.
 *
 * @module hubMessages
 */

import { webSocket, logMessage } from "./hubState";
import { IHubState } from "./hubState";

/**
 * Sends a partial state update to the central hub.
 *
 * This is a convenience wrapper around updateSharedState that handles
 * WebSocket connection state checking and automatic retry logic.
 * If the WebSocket is not ready, it will queue the update and retry
 * after 1 second.
 *
 * @param data - Partial hub state to update
 *
 * @example
 * ```typescript
 * // Update servo angles
 * sendHubStateUpdate({
 *   servo_angles: { pan: 90, tilt: 45 }
 * });
 *
 * // Update behavior mode
 * sendHubStateUpdate({
 *   daphbot_mode: BehaviorMode.Manual
 * });
 * ```
 */
export function sendHubStateUpdate(data: Partial<IHubState>) {
    logMessage("sending state update", { data, webSocket });
    if (webSocket && webSocket.readyState === WebSocket.OPEN) {
        webSocket.send(
            JSON.stringify({
                type: "updateState",
                data,
            })
        );
    } else {
        console.warn("WebSocket not ready, queuing state update:", data);
        // Queue the message to send once connected
        setTimeout(() => {
            if (webSocket && webSocket.readyState === WebSocket.OPEN) {
                webSocket.send(
                    JSON.stringify({
                        type: "updateState",
                        data,
                    })
                );
            }
        }, 1000);
    }
}
