import type { Meta, StoryObj } from "@storybook/react";
import { HubStateProvider } from "./HubStateProvider";
import { PanTilt } from "../components/PanTilt/PanTilt";
import { ObjectsOverlay } from "../components/ObjectsOverlay/ObjectsOverlay";
import { useHubState } from "./useHubState";
import { useEffect } from "react";
import { IHubState, IServoConfig } from "../utils/hubState";

// Mock servo config for demo
const mockServoConfig: IServoConfig = {
    servos: [
        {
            name: "pan",
            channel: 0,
            motor_range: 180,
            min_angle: 0,
            max_angle: 180,
            min_pulse: 500,
            max_pulse: 2500,
        },
        {
            name: "tilt",
            channel: 1,
            motor_range: 180,
            min_angle: 0,
            max_angle: 180,
            min_pulse: 500,
            max_pulse: 2500,
        },
    ],
};

// Demo component that displays hub state
function HubStateDisplay() {
    const hubState = useHubState();

    return (
        <div style={{ padding: "20px", backgroundColor: "#f0f0f0" }}>
            <h3>Hub State</h3>
            <pre>{JSON.stringify(hubState, null, 2)}</pre>
        </div>
    );
}

// Demo component showing PanTilt with provider
function PanTiltWithProvider() {
    return (
        <div style={{ padding: "20px" }}>
            <h3>PanTilt Component (using context)</h3>
            <PanTilt />
        </div>
    );
}

// Demo component that simulates state updates for Storybook
function MockStateUpdater({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        // In a real app, this would come from the hub
        // For Storybook, we'll simulate it
        const mockState: Partial<IHubState> = {
            hubConnStatus: "online",
            hub_stats: { state_updates_recv: 42 },
            servo_config: mockServoConfig,
            servo_angles: { pan: 90, tilt: 90 },
            servo_actual_angles: { pan: 88, tilt: 92 },
            recognition: [
                {
                    classification: "person",
                    confidence: 0.95,
                    bounding_box: [100, 100, 300, 400],
                },
            ],
        };

        // Note: In Storybook, connectToHub won't actually connect
        // So this is just for demonstration
        console.log("Mock state would be:", mockState);
    }, []);

    return <>{children}</>;
}

const meta: Meta<typeof HubStateProvider> = {
    component: HubStateProvider,
    tags: ["autodocs"],
    parameters: {
        layout: "fullscreen",
    },
};

export default meta;
type Story = StoryObj<typeof HubStateProvider>;

/**
 * Basic usage with HubStateProvider wrapping components.
 * Components automatically receive hub state without prop drilling.
 */
export const BasicUsage: Story = {
    render: () => (
        <HubStateProvider autoConnect={false}>
            <div style={{ padding: "20px" }}>
                <h2>Components Using HubStateProvider</h2>
                <p>
                    Components wrapped in HubStateProvider can access hub state
                    via context
                </p>
                <HubStateDisplay />
            </div>
        </HubStateProvider>
    ),
};

/**
 * Example showing PanTilt component using the provider.
 * No props needed - state comes from context.
 */
export const WithPanTilt: Story = {
    render: () => (
        <HubStateProvider autoConnect={false}>
            <MockStateUpdater>
                <div style={{ padding: "20px" }}>
                    <h2>PanTilt with Provider</h2>
                    <p>
                        PanTilt component gets servo config and angles from
                        context
                    </p>
                    <PanTiltWithProvider />
                </div>
            </MockStateUpdater>
        </HubStateProvider>
    ),
};

/**
 * Example with custom configuration options.
 */
export const CustomConfiguration: Story = {
    render: () => (
        <HubStateProvider
            port={5200}
            autoConnect={false}
            autoReconnect={false}
        >
            <div style={{ padding: "20px" }}>
                <h2>Custom Provider Configuration</h2>
                <p>Port: 5200, autoConnect: false, autoReconnect: false</p>
                <HubStateDisplay />
            </div>
        </HubStateProvider>
    ),
};

/**
 * Example showing multiple components using the same provider.
 */
export const MultipleComponents: Story = {
    render: () => (
        <HubStateProvider autoConnect={false}>
            <MockStateUpdater>
                <div style={{ padding: "20px" }}>
                    <h2>Multiple Components Sharing State</h2>
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: "20px",
                        }}
                    >
                        <div>
                            <h3>PanTilt Control</h3>
                            <PanTilt />
                        </div>
                        <div>
                            <h3>Objects Overlay</h3>
                            <div
                                style={{
                                    position: "relative",
                                    width: "400px",
                                    height: "300px",
                                    backgroundColor: "#000",
                                }}
                            >
                                <ObjectsOverlay />
                            </div>
                        </div>
                    </div>
                </div>
            </MockStateUpdater>
        </HubStateProvider>
    ),
};
