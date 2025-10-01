import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ObjectsOverlay } from "./ObjectsOverlay";
import { IRecognizedObject } from "../../utils/hubState";

describe("ObjectsOverlay", () => {
    it("renders nothing when no objects provided", () => {
        const { container } = render(<ObjectsOverlay />);
        expect(container.firstChild).toBeNull();
    });

    it("renders nothing when empty array provided", () => {
        const { container } = render(<ObjectsOverlay recogObjects={[]} />);
        expect(container.firstChild).toBeNull();
    });

    it("renders bounding box for single object", () => {
        const objects: IRecognizedObject[] = [
            {
                classification: "person",
                confidence: 0.95,
                bounding_box: [10, 20, 100, 120],
            },
        ];

        render(<ObjectsOverlay recogObjects={objects} />);

        expect(screen.getByText("person")).toBeInTheDocument();
        expect(screen.getByText("0.950")).toBeInTheDocument();
    });

    it("renders multiple bounding boxes", () => {
        const objects: IRecognizedObject[] = [
            {
                classification: "person",
                confidence: 0.95,
                bounding_box: [10, 20, 100, 120],
            },
            {
                classification: "cat",
                confidence: 0.87,
                bounding_box: [150, 30, 250, 150],
            },
        ];

        render(<ObjectsOverlay recogObjects={objects} />);

        expect(screen.getByText("person")).toBeInTheDocument();
        expect(screen.getByText("0.950")).toBeInTheDocument();
        expect(screen.getByText("cat")).toBeInTheDocument();
        expect(screen.getByText("0.870")).toBeInTheDocument();
    });

    it("applies correct positioning styles", () => {
        const objects: IRecognizedObject[] = [
            {
                classification: "dog",
                confidence: 0.92,
                bounding_box: [50, 60, 150, 180],
            },
        ];

        const { container } = render(<ObjectsOverlay recogObjects={objects} />);
        const boxElement = container.querySelector('[style*="left"]');

        expect(boxElement).toHaveStyle({
            top: "60px",
            left: "50px",
            height: "120px",
            width: "100px",
        });
    });

    it("formats confidence to 3 decimal places", () => {
        const objects: IRecognizedObject[] = [
            {
                classification: "bird",
                confidence: 0.123456,
                bounding_box: [10, 20, 100, 120],
            },
        ];

        render(<ObjectsOverlay recogObjects={objects} />);

        expect(screen.getByText("0.123")).toBeInTheDocument();
    });
});
