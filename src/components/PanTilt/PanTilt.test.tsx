import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PanTilt } from "./PanTilt";
import { IServoConfig } from "../../utils/hubState";

// Mock the utility functions
vi.mock("../../utils/hubMessages", () => ({
    sendHubStateUpdate: vi.fn(),
}));

vi.mock("../../utils/angleUtils", () => ({
    mapPanTiltToXYSquare: vi.fn(
        (_panAngle, _panServo, _tiltAngle, _tiltServo) => {
            // Simple mock implementation
            return [100, 100];
        },
    ),
    mapXYToPanTilt: vi.fn((_x, _y) => {
        // Simple mock implementation
        return [90, 45];
    }),
}));

vi.mock("../../utils/uiUtils", () => ({
    isTouchEvent: vi.fn((_e) => false),
}));

describe("PanTilt", () => {
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

    const mockServoAngles = { pan: 90, tilt: 45 };
    const mockServoActualAngles = { pan: 90, tilt: 45 };

    it("renders nothing when no servoConfig provided", () => {
        const { container } = render(<PanTilt />);
        expect(container.firstChild).toBeNull();
    });

    it("renders nothing when servo config missing pan or tilt", () => {
        const consoleSpy = vi
            .spyOn(console, "error")
            .mockImplementation(() => {});

        const incompleteConfig: IServoConfig = {
            servos: [
                {
                    name: "other",
                    channel: 0,
                    motor_range: 180,
                    min_angle: 0,
                    max_angle: 180,
                    min_pulse: 500,
                    max_pulse: 2500,
                },
            ],
        };

        const { container } = render(
            <PanTilt servoConfig={incompleteConfig} />,
        );
        expect(container.firstChild).toBeNull();
        expect(consoleSpy).toHaveBeenCalled();

        consoleSpy.mockRestore();
    });

    it("renders pan tilt control with valid config", () => {
        render(
            <PanTilt
                servoConfig={mockServoConfig}
                servoAngles={mockServoAngles}
                servoActualAngles={mockServoActualAngles}
            />,
        );

        expect(screen.getByTestId("pan-tilt")).toBeInTheDocument();
    });

    it("displays pan servo range", () => {
        render(
            <PanTilt
                servoConfig={mockServoConfig}
                servoAngles={mockServoAngles}
                servoActualAngles={mockServoActualAngles}
            />,
        );

        // Both pan and tilt have the same range, so there are multiple 180° and 0° elements
        const ranges180 = screen.getAllByText("180°");
        const ranges0 = screen.getAllByText("0°");

        expect(ranges180.length).toBeGreaterThan(0);
        expect(ranges0.length).toBeGreaterThan(0);
    });

    it("displays current pan angle", () => {
        render(
            <PanTilt
                servoConfig={mockServoConfig}
                servoAngles={mockServoAngles}
                servoActualAngles={mockServoActualAngles}
            />,
        );

        expect(screen.getByText(/Pan \(90\.0\)/)).toBeInTheDocument();
    });

    it("renders touch grid", () => {
        const { container } = render(
            <PanTilt
                servoConfig={mockServoConfig}
                servoAngles={mockServoAngles}
                servoActualAngles={mockServoActualAngles}
            />,
        );

        const touchGrid = container.querySelector('[class*="touchGrid"]');
        expect(touchGrid).toBeInTheDocument();
    });

    it("handles click events on touch grid", async () => {
        const { sendHubStateUpdate } = await import("../../utils/hubMessages");

        const { container } = render(
            <PanTilt
                servoConfig={mockServoConfig}
                servoAngles={mockServoAngles}
                servoActualAngles={mockServoActualAngles}
            />,
        );

        const touchGrid = container.querySelector('[class*="touchGrid"]');
        if (touchGrid) {
            fireEvent.click(touchGrid, { clientX: 100, clientY: 100 });
            expect(sendHubStateUpdate).toHaveBeenCalled();
        }
    });

    it("renders angle indicators", () => {
        const { container } = render(
            <PanTilt
                servoConfig={mockServoConfig}
                servoAngles={mockServoAngles}
                servoActualAngles={mockServoActualAngles}
            />,
        );

        const angleXY = container.querySelector('[class*="angleXY"]');
        const angleActualXY = container.querySelector(
            '[class*="angleActualXY"]',
        );

        expect(angleXY).toBeInTheDocument();
        expect(angleActualXY).toBeInTheDocument();
    });
});
