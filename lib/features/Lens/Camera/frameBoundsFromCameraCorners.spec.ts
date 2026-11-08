import type { Frame } from 'react-native-vision-camera';

import { frameBoundsFromCameraCorners } from './frameBoundsFromCameraCorners';

const createMockFrame = (
  convertCameraPointToFramePoint: (point: { x: number; y: number }) => { x: number; y: number }
): Frame =>
  ({
    convertCameraPointToFramePoint,
    dispose: jest.fn(),
  }) as unknown as Frame;

describe('frameBoundsFromCameraCorners', () => {
  it('returns axis-aligned bounds from four ordered corners', () => {
    const frame = createMockFrame(({ x, y }) => ({ x, y }));

    expect(
      frameBoundsFromCameraCorners(
        frame,
        { x: 10, y: 20 },
        { x: 100, y: 20 },
        { x: 100, y: 80 },
        { x: 10, y: 80 }
      )
    ).toEqual({
      left: 10,
      top: 20,
      right: 100,
      bottom: 80,
    });
  });

  it('normalizes rotated corner order to min/max LTRB', () => {
    const frame = createMockFrame(({ x, y }) => ({ x, y }));

    expect(
      frameBoundsFromCameraCorners(
        frame,
        { x: 100, y: 80 },
        { x: 10, y: 80 },
        { x: 10, y: 20 },
        { x: 100, y: 20 }
      )
    ).toEqual({
      left: 10,
      top: 20,
      right: 100,
      bottom: 80,
    });
  });

  it('uses convertCameraPointToFramePoint for every corner', () => {
    const convertCameraPointToFramePoint = jest.fn(({ x, y }: { x: number; y: number }) => ({
      x: x * 2,
      y: y * 3,
    }));
    const frame = createMockFrame(convertCameraPointToFramePoint);

    expect(
      frameBoundsFromCameraCorners(
        frame,
        { x: 1, y: 2 },
        { x: 4, y: 2 },
        { x: 4, y: 5 },
        { x: 1, y: 5 }
      )
    ).toEqual({
      left: 2,
      top: 6,
      right: 8,
      bottom: 15,
    });
    expect(convertCameraPointToFramePoint).toHaveBeenCalledTimes(4);
  });
});
