import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { HubStateProvider } from "./HubStateProvider";
import { useHubState } from "./useHubState";
import { IHubState } from "../utils/hubState";

// Mock the hubState utility functions
vi.mock("../utils/hubState", async () => {
    const actual =
        await vi.importActual<typeof import("../utils/hubState")>(
            "../utils/hubState",
        );
    return {
        ...actual,
        connectToHub: vi.fn(),
        addHubStateUpdatedListener: vi.fn(),
        removeHubStateUpdatedListener: vi.fn(),
        DEFAULT_HUB_STATE: {
            hubConnStatus: "offline",
            hub_stats: { state_updates_recv: 0 },
        },
        DEFAULT_BB_HUB_PORT: 5100,
    };
});

// Test component that uses the hook
function TestComponent() {
    const hubState = useHubState();
    return (
        <div>
            <div data-testid="conn-status">{hubState.hubConnStatus}</div>
            <div data-testid="updates-recv">
                {hubState.hub_stats.state_updates_recv}
            </div>
        </div>
    );
}

describe("HubStateProvider", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("provides hub state to children", () => {
        render(
            <HubStateProvider>
                <TestComponent />
            </HubStateProvider>,
        );

        expect(screen.getByTestId("conn-status")).toHaveTextContent("offline");
        expect(screen.getByTestId("updates-recv")).toHaveTextContent("0");
    });

    it("connects to hub when autoConnect is true", async () => {
        const { connectToHub } = await import("../utils/hubState");

        render(
            <HubStateProvider autoConnect={true}>
                <TestComponent />
            </HubStateProvider>,
        );

        await waitFor(() => {
            expect(connectToHub).toHaveBeenCalledWith({
                port: 5100,
                state: expect.any(Object),
                autoReconnect: true,
            });
        });
    });

    it("does not connect when autoConnect is false", async () => {
        const { connectToHub } = await import("../utils/hubState");

        render(
            <HubStateProvider autoConnect={false}>
                <TestComponent />
            </HubStateProvider>,
        );

        expect(connectToHub).not.toHaveBeenCalled();
    });

    it("uses custom port when provided", async () => {
        const { connectToHub } = await import("../utils/hubState");

        render(
            <HubStateProvider port={5200}>
                <TestComponent />
            </HubStateProvider>,
        );

        await waitFor(() => {
            expect(connectToHub).toHaveBeenCalledWith({
                port: 5200,
                state: expect.any(Object),
                autoReconnect: true,
            });
        });
    });

    it("passes autoReconnect option to connectToHub", async () => {
        const { connectToHub } = await import("../utils/hubState");

        render(
            <HubStateProvider autoReconnect={false}>
                <TestComponent />
            </HubStateProvider>,
        );

        await waitFor(() => {
            expect(connectToHub).toHaveBeenCalledWith({
                port: 5100,
                state: expect.any(Object),
                autoReconnect: false,
            });
        });
    });

    it("adds hub state listener on mount", async () => {
        const { addHubStateUpdatedListener } = await import(
            "../utils/hubState"
        );

        render(
            <HubStateProvider>
                <TestComponent />
            </HubStateProvider>,
        );

        await waitFor(() => {
            expect(addHubStateUpdatedListener).toHaveBeenCalledWith(
                expect.any(Function),
            );
        });
    });

    it("removes hub state listener on unmount", async () => {
        const { addHubStateUpdatedListener, removeHubStateUpdatedListener } =
            await import("../utils/hubState");

        let capturedHandler: ((state: IHubState) => void) | null = null;

        vi.mocked(addHubStateUpdatedListener).mockImplementation(
            (handler: (state: IHubState) => void) => {
                capturedHandler = handler;
            },
        );

        const { unmount } = render(
            <HubStateProvider>
                <TestComponent />
            </HubStateProvider>,
        );

        await waitFor(() => {
            expect(capturedHandler).not.toBeNull();
        });

        unmount();

        expect(removeHubStateUpdatedListener).toHaveBeenCalledWith(
            capturedHandler,
        );
    });

    it("updates state when hub state changes", async () => {
        const { addHubStateUpdatedListener } = await import(
            "../utils/hubState"
        );

        let stateUpdateHandler: ((state: IHubState) => void) | null = null;

        vi.mocked(addHubStateUpdatedListener).mockImplementation(
            (handler: (state: IHubState) => void) => {
                stateUpdateHandler = handler;
            },
        );

        render(
            <HubStateProvider>
                <TestComponent />
            </HubStateProvider>,
        );

        await waitFor(() => {
            expect(stateUpdateHandler).not.toBeNull();
        });

        // Simulate hub state update
        const newState: IHubState = {
            hubConnStatus: "online",
            hub_stats: { state_updates_recv: 5 },
        };

        if (stateUpdateHandler) {
            stateUpdateHandler(newState);
        }

        await waitFor(() => {
            expect(screen.getByTestId("conn-status")).toHaveTextContent(
                "online",
            );
            expect(screen.getByTestId("updates-recv")).toHaveTextContent("5");
        });
    });
});
