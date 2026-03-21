/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { initBackground, drawBackground } from '../../src/rendering/background'
import { BACKGROUND, COLORS_DARK } from '../../src/config'

// Mock p5 instance and its methods
const mockContext = {
  createRadialGradient: vi.fn(() => ({
    addColorStop: vi.fn(),
  })),
  fillRect: vi.fn(),
};

const mockGraphics = {
  pixelDensity: vi.fn(),
  clear: vi.fn(),
  noStroke: vi.fn(),
  fill: vi.fn(),
  rect: vi.fn(),
  drawingContext: mockContext,
};

const mockColor = {
  setAlpha: vi.fn(),
};

const mockP5 = {
  createGraphics: vi.fn(() => mockGraphics),
  color: vi.fn(() => mockColor),
  red: vi.fn(() => 10),
  green: vi.fn(() => 10),
  blue: vi.fn(() => 18),
  noise: vi.fn(() => 0.5),
  random: vi.fn((min) => min),
  image: vi.fn(),
  noStroke: vi.fn(),
  fill: vi.fn(),
  ellipse: vi.fn(),
  tint: vi.fn(),
  noTint: vi.fn(),
  frameCount: 0,
  width: 800,
  height: 600,
};

describe('Background Rendering', () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initBackground should create graphics buffers and dust particles', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    initBackground(mockP5 as any, COLORS_DARK);

    // Should create two graphics buffers (noise and vignette)
    expect(mockP5.createGraphics).toHaveBeenCalledTimes(2);
    expect(mockP5.createGraphics).toHaveBeenCalledWith(800, 600);
    
    // Should immediately update the noise and vignette buffers
    expect(mockGraphics.clear).toHaveBeenCalled();

    // Check if dust particles were created
    // This is tricky because dustParticles is a module-level variable. 
    // We can't access it directly, but we can infer from the calls to random().
    // It's called for x, y, size, and noiseOffset for each dust particle.
    expect(mockP5.random).toHaveBeenCalledTimes(BACKGROUND.dustCount * 4);
  });

  it('drawBackground should draw images and particles', () => {
    mockP5.frameCount = 30; // Trigger noise update
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    drawBackground(mockP5 as any, COLORS_DARK, true);
    
    // Should draw the noise buffer
    expect(mockP5.image).toHaveBeenCalled();

    // Should draw dust particles
    expect(mockP5.ellipse).toHaveBeenCalledTimes(BACKGROUND.dustCount);
  });
});
