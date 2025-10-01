import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { VideoFeed } from './VideoFeed';

// Mock the videoHost constant
vi.mock('../../utils/hubState', () => ({
  videoHost: 'localhost:5801',
}));

describe('VideoFeed', () => {
  it('renders placeholder when inactive', () => {
    render(<VideoFeed isActive={false} />);
    const img = screen.getByAltText('please stand by');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/please-stand-by.png');
  });

  it('attempts to load video feed when active', () => {
    render(<VideoFeed isActive={true} />);
    // Initially shows placeholder while loading
    const img = screen.getByRole('img');
    expect(img).toBeInTheDocument();
  });

  it('shows video feed URL when active and loaded', async () => {
    render(<VideoFeed isActive={true} />);
    const img = screen.getByRole('img') as HTMLImageElement;

    // Simulate successful load
    img.dispatchEvent(new Event('load'));

    await waitFor(() => {
      expect(img.src).toContain('http://localhost:5801/video_feed');
    });
  });

  it('hides video when inactive', () => {
    render(<VideoFeed isActive={false} />);
    const img = screen.getByRole('img', { hidden: true }) as HTMLImageElement;

    expect(img).toHaveStyle({ display: 'none' });
  });

  it('handles error state', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<VideoFeed isActive={true} />);
    const img = screen.getByRole('img') as HTMLImageElement;

    // Simulate error
    img.dispatchEvent(new Event('error'));

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
      expect(img.src).toContain('/please-stand-by.png');
    });

    consoleSpy.mockRestore();
  });

  it('updates state on successful load', async () => {
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    render(<VideoFeed isActive={true} />);
    const img = screen.getByRole('img') as HTMLImageElement;

    // Simulate successful load
    img.dispatchEvent(new Event('load'));

    await waitFor(() => {
      expect(consoleLogSpy).toHaveBeenCalledWith('video feed loaded');
    });

    consoleLogSpy.mockRestore();
  });
});
