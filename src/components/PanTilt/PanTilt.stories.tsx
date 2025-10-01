import type { Meta, StoryObj } from '@storybook/react';
import { PanTilt } from './PanTilt';
import { IServoConfig } from '../../utils/hubState';

const mockServoConfig: IServoConfig = {
  servos: [
    {
      name: 'pan',
      channel: 0,
      motor_range: 180,
      min_angle: 0,
      max_angle: 180,
      min_pulse: 500,
      max_pulse: 2500,
    },
    {
      name: 'tilt',
      channel: 1,
      motor_range: 180,
      min_angle: 0,
      max_angle: 180,
      min_pulse: 500,
      max_pulse: 2500,
    },
  ],
};

const meta: Meta<typeof PanTilt> = {
  component: PanTilt,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof PanTilt>;

export const Centered: Story = {
  args: {
    servoConfig: mockServoConfig,
    servoAngles: { pan: 90, tilt: 90 },
    servoActualAngles: { pan: 90, tilt: 90 },
  },
};

export const TopLeft: Story = {
  args: {
    servoConfig: mockServoConfig,
    servoAngles: { pan: 180, tilt: 180 },
    servoActualAngles: { pan: 180, tilt: 180 },
  },
};

export const BottomRight: Story = {
  args: {
    servoConfig: mockServoConfig,
    servoAngles: { pan: 0, tilt: 0 },
    servoActualAngles: { pan: 0, tilt: 0 },
  },
};

export const MovingToTarget: Story = {
  args: {
    servoConfig: mockServoConfig,
    servoAngles: { pan: 120, tilt: 60 },
    servoActualAngles: { pan: 90, tilt: 90 },
  },
};

export const NoConfig: Story = {
  args: {},
};
