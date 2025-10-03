/**
 * HubState Context Provider
 *
 * Provides a React context for accessing robot hub state throughout your application.
 * Eliminates the need for manual state management and prop drilling.
 *
 * @module HubStateProvider
 */

import { createContext, useEffect, useState, ReactNode } from "react";
import {
    IHubState,
    DEFAULT_HUB_STATE,
    connectToHub,
    addHubStateUpdatedListener,
    removeHubStateUpdatedListener,
    DEFAULT_BB_HUB_PORT,
} from "../utils/hubState";

/**
 * React context for hub state.
 * Use the `useHubState` hook to access this context in your components.
 */
// eslint-disable-next-line react-refresh/only-export-components
export const HubStateContext = createContext<IHubState | null>(null);

/**
 * Configuration options for the HubStateProvider.
 */
export interface HubStateProviderProps {
    /** Child components that will have access to hub state */
    children: ReactNode;

    /** WebSocket port number for the hub connection (default: 5100) */
    port?: number;

    /** Automatically connect to hub on mount (default: true) */
    autoConnect?: boolean;

    /** Automatically reconnect on connection loss (default: true) */
    autoReconnect?: boolean;
}

/**
 * Provider component that manages hub state and WebSocket connection.
 *
 * Wrap your application or component tree with this provider to enable
 * automatic hub state management. Components can then use the `useHubState`
 * hook to access the current state without prop drilling.
 *
 * @example
 * ```tsx
 * import { HubStateProvider, PanTilt } from "basic_bot_react";
 *
 * function App() {
 *     return (
 *         <HubStateProvider>
 *             <PanTilt />
 *         </HubStateProvider>
 *     );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Custom port and configuration
 * <HubStateProvider port={5200} autoReconnect={false}>
 *     <YourComponents />
 * </HubStateProvider>
 * ```
 */
export function HubStateProvider({
    children,
    port = DEFAULT_BB_HUB_PORT,
    autoConnect = true,
    autoReconnect = true,
}: HubStateProviderProps) {
    const [hubState, setHubState] = useState<IHubState>(DEFAULT_HUB_STATE);

    useEffect(() => {
        const handleHubStateUpdate = (newState: Partial<IHubState>) => {
            setHubState({ ...newState } as IHubState);
        };
        addHubStateUpdatedListener(handleHubStateUpdate);
        if (autoConnect) {
            connectToHub({
                port,
                state: DEFAULT_HUB_STATE,
                autoReconnect,
            });
        }

        // Cleanup on unmount
        return () => {
            removeHubStateUpdatedListener(handleHubStateUpdate);
        };
    }, [port, autoConnect, autoReconnect]);

    return (
        <HubStateContext.Provider value={hubState}>
            {children}
        </HubStateContext.Provider>
    );
}
