import type { Meta, StoryObj } from '@storybook/react';
import { VideoFeed } from './VideoFeed';

const meta: Meta<typeof VideoFeed> = {
  component: VideoFeed,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof VideoFeed>;

export const Active: Story = {
  args: {
    isActive: true,
  },
};

export const Inactive: Story = {
  args: {
    isActive: false,
  },
};
