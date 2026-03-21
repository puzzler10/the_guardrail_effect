/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { initBackground, drawBackground } from '../../src/rendering/background'
import { BACKGROUND } from '../../src/config'

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
  colorMode: vi.fn(),
  drawingContext: mockContext,
  width: 800,
  height: 600,
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
  push: vi.fn(),
  pop: vi.fn(),
  lerp: vi.fn((a, b, t) => a + (b - a) * t),
  blendMode: vi.fn(),
  SCREEN: "screen",
  BLEND: "blend",
  frameCount: 0,
  width: 800,
  height: 600,
  HSB: 'hsb',
};

describe('Background Rendering', () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initBackground should create graphics buffers and dust particles', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    initBackground(mockP5 as any);

    // Should create four graphics buffers (storm base, cloud2, rainbow, vignette)
    expect(mockP5.createGraphics).toHaveBeenCalledTimes(4);
    expect(mockP5.createGraphics).toHaveBeenCalledWith(800, 600);
    
    // Should immediately update the buffers
    expect(mockGraphics.clear).toHaveBeenCalled();

    // Check if dust particles were created
    expect(mockP5.random).toHaveBeenCalledTimes(BACKGROUND.dustCount * 4);
  });

  it('drawBackground should draw images and particles', () => {
    mockP5.frameCount = 30;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    drawBackground(mockP5 as any, true);
    
    // Should draw buffers (using tint for transitions)
    expect(mockP5.tint).toHaveBeenCalled();
    expect(mockP5.image).toHaveBeenCalled();

    // Should draw dust particles
    expect(mockP5.ellipse).toHaveBeenCalledTimes(BACKGROUND.dustCount);
  });
});
