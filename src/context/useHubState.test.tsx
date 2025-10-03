import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useHubState } from "./useHubState";
import { HubStateProvider } from "./HubStateProvider";

describe("useHubState", () => {
    it("throws error when used outside provider", () => {
        // Suppress console.error for this test since we expect an error
        const consoleSpy = vi
            .spyOn(console, "error")
            .mockImplementation(() => {});

        expect(() => {
            renderHook(() => useHubState());
        }).toThrow("useHubState must be used within a HubStateProvider");

        consoleSpy.mockRestore();
    });

    it("returns hub state when used inside provider", () => {
        const { result } = renderHook(() => useHubState(), {
            wrapper: HubStateProvider,
        });

        expect(result.current).toBeDefined();
        expect(result.current.hubConnStatus).toBeDefined();
        expect(result.current.hub_stats).toBeDefined();
    });
});
