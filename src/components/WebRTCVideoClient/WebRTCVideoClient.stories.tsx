import type { Meta, StoryObj } from "@storybook/react";
import { WebRTCVideoClient } from "./WebRTCVideoClient";

const meta: Meta<typeof WebRTCVideoClient> = {
    component: WebRTCVideoClient,
    tags: ["autodocs"],
    parameters: {
        layout: "fullscreen",
    },
};

export default meta;
type Story = StoryObj<typeof WebRTCVideoClient>;

export const ActiveWithAudio: Story = {
    args: {
        isActive: true,
        audioEnabled: true,
    },
};

export const ActiveMuted: Story = {
    args: {
        isActive: true,
        audioEnabled: false,
    },
};

export const Inactive: Story = {
    args: {
        isActive: false,
        audioEnabled: false,
    },
};
