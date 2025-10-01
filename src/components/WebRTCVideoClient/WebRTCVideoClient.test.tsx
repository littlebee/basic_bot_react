import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WebRTCVideoClient } from './WebRTCVideoClient';

// Mock the WebRTCClient class
vi.mock('../../utils/webrtcClient', () => ({
  WebRTCClient: vi.fn().mockImplementation(() => ({
    start: vi.fn(),
    stop: vi.fn(),
  })),
}));

describe('WebRTCVideoClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders video and audio elements', () => {
    const { container } = render(
      <WebRTCVideoClient isActive={false} audioEnabled={false} />
    );

    const video = container.querySelector('video');
    const audio = container.querySelector('audio');

    expect(video).toBeInTheDocument();
    expect(audio).toBeInTheDocument();
  });

  it('video element has correct attributes', () => {
    const { container } = render(
      <WebRTCVideoClient isActive={true} audioEnabled={true} />
    );

    const video = container.querySelector('video');

    expect(video).toHaveAttribute('autoplay');
    expect(video).toHaveAttribute('playsinline');
    expect(video).toHaveAttribute('muted');
  });

  it('audio is muted when audioEnabled is false', () => {
    const { container } = render(
      <WebRTCVideoClient isActive={true} audioEnabled={false} />
    );

    const audio = container.querySelector('audio') as HTMLAudioElement;
    expect(audio.muted).toBe(true);
  });

  it('audio is unmuted when audioEnabled is true', () => {
    const { container } = render(
      <WebRTCVideoClient isActive={true} audioEnabled={true} />
    );

    const audio = container.querySelector('audio') as HTMLAudioElement;
    expect(audio.muted).toBe(false);
  });

  it('applies correct styling to video element', () => {
    const { container } = render(
      <WebRTCVideoClient isActive={true} audioEnabled={true} />
    );

    const video = container.querySelector('video');

    expect(video).toHaveStyle({
      width: '100%',
      height: '100%',
      objectFit: 'contain',
      backgroundColor: '#000',
    });
  });

  it('logs when audio state changes', () => {
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    render(<WebRTCVideoClient isActive={true} audioEnabled={true} />);

    expect(consoleLogSpy).toHaveBeenCalledWith('WebRTC: Audio', 'enabled');

    consoleLogSpy.mockRestore();
  });

  it('wrapper div has correct positioning', () => {
    const { container } = render(
      <WebRTCVideoClient isActive={true} audioEnabled={true} />
    );

    const wrapper = container.firstChild as HTMLElement;

    expect(wrapper).toHaveStyle({
      position: 'relative',
      width: '100%',
      height: '100%',
    });
  });
});
