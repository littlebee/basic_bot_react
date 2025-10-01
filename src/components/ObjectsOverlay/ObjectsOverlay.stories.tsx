import type { Meta, StoryObj } from "@storybook/react";
import { ObjectsOverlay } from "./ObjectsOverlay";

const meta: Meta<typeof ObjectsOverlay> = {
    component: ObjectsOverlay,
    tags: ["autodocs"],
    parameters: {
        layout: "centered",
    },
};

export default meta;
type Story = StoryObj<typeof ObjectsOverlay>;

export const NoObjects: Story = {
    args: {
        recogObjects: [],
    },
};

export const SingleObject: Story = {
    args: {
        recogObjects: [
            {
                classification: "person",
                confidence: 0.95,
                bounding_box: [50, 50, 200, 250],
            },
        ],
    },
};

export const MultipleObjects: Story = {
    args: {
        recogObjects: [
            {
                classification: "person",
                confidence: 0.95,
                bounding_box: [50, 50, 200, 250],
            },
            {
                classification: "cat",
                confidence: 0.87,
                bounding_box: [220, 100, 350, 280],
            },
            {
                classification: "dog",
                confidence: 0.92,
                bounding_box: [380, 60, 480, 200],
            },
        ],
    },
};

export const LowConfidence: Story = {
    args: {
        recogObjects: [
            {
                classification: "unknown",
                confidence: 0.45,
                bounding_box: [100, 100, 250, 250],
            },
        ],
    },
};
