/**
 * Hook for accessing hub state from React components.
 *
 * @module useHubState
 */

import { useContext } from "react";
import { HubStateContext } from "./HubStateProvider";
import { IHubState } from "../utils/hubState";

/**
 * React hook to access the current hub state.
 *
 * This hook provides access to the robot's hub state when used within a
 * `HubStateProvider`. It will throw an error if used outside the provider
 * to help catch configuration mistakes early.
 *
 * @returns The current hub state
 * @throws Error if used outside of HubStateProvider
 *
 * @example
 * ```tsx
 * import { useHubState } from "basic_bot_react";
 *
 * function MyComponent() {
 *     const hubState = useHubState();
 *
 *     return (
 *         <div>
 *             <p>Connection: {hubState.hubConnStatus}</p>
 *             <p>Pan angle: {hubState.servo_angles?.pan}</p>
 *         </div>
 *     );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Use with optional chaining for safety
 * function ServoDisplay() {
 *     const hubState = useHubState();
 *     const panAngle = hubState.servo_angles?.pan ?? 0;
 *
 *     return <div>Pan: {panAngle}°</div>;
 * }
 * ```
 */
export function useHubState(): IHubState {
    const context = useContext(HubStateContext);

    if (context === null) {
        throw new Error(
            "useHubState must be used within a HubStateProvider. " +
                "Wrap your component tree with <HubStateProvider>...</HubStateProvider> " +
                "to use this hook.",
        );
    }

    return context;
}
