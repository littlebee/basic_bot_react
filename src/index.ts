// Main entry point for the library
// Export all components
export * from "./components";

// Export context provider and hook
export { HubStateProvider } from "./context/HubStateProvider";
export type { HubStateProviderProps } from "./context/HubStateProvider";
export { useHubState } from "./context/useHubState";

// Export useful types and utilities
export type {
    IHubState,
    IRecognizedObject,
    IServo,
    IServoConfig,
    ISystemStats,
    I2WMotorSpeeds,
    ConnectToHubOptions,
} from "./utils/hubState";

export {
    connectToHub,
    addHubStateUpdatedListener,
    removeHubStateUpdatedListener,
    getLocalState,
    getStateFromCentralHub,
    updateSharedState,
    DEFAULT_HUB_STATE,
    DEFAULT_BB_HUB_PORT,
    hubHost,
    videoHost,
    logMessages,
} from "./utils/hubState";

export { sendHubStateUpdate } from "./utils/hubMessages";
export { WebRTCClient } from "./utils/webrtcClient";
