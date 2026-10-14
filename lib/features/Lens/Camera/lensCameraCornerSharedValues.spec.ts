import type { SharedValue } from 'react-native-reanimated';
import type { CameraRef } from 'react-native-vision-camera';

import {
  clearLensCameraCorners,
  writeViewRectToCameraCorners,
  type LensCameraCornerSharedValues,
} from './lensCameraCornerSharedValues';

const createSharedNumber = (initial: number): SharedValue<number> =>
  ({ value: initial }) as SharedValue<number>;

const createCorners = (): LensCameraCornerSharedValues => ({
  x1: createSharedNumber(0),
  y1: createSharedNumber(0),
  x2: createSharedNumber(0),
  y2: createSharedNumber(0),
  ready: createSharedNumber(1),
});

describe('clearLensCameraCorners', () => {
  it('sets ready to 0', () => {
    const corners = createCorners();
    clearLensCameraCorners(corners);
    expect(corners.ready.value).toBe(0);
  });
});

describe('writeViewRectToCameraCorners', () => {
  it('writes converted camera corners and marks ready', () => {
    const camera = {
      convertViewPointToCameraPoint: ({ x, y }: { x: number; y: number }) => ({
        x: x + 1,
        y: y + 2,
      }),
    } as CameraRef;
    const corners = createCorners();
    corners.ready.value = 0;

    writeViewRectToCameraCorners(
      camera,
      { x1: 10, y1: 20, x2: 100, y2: 80 },
      corners
    );

    expect(corners.x1.value).toBe(11);
    expect(corners.y1.value).toBe(22);
    expect(corners.x2.value).toBe(101);
    expect(corners.y2.value).toBe(82);
    expect(corners.ready.value).toBe(1);
  });

  it('invokes convertViewPointToCameraPoint for both view corners', () => {
    const convertViewPointToCameraPoint = jest.fn(({ x, y }: { x: number; y: number }) => ({
      x,
      y,
    }));
    const camera = { convertViewPointToCameraPoint } as unknown as CameraRef;
    const corners = createCorners();

    writeViewRectToCameraCorners(
      camera,
      { x1: 1, y1: 2, x2: 3, y2: 4 },
      corners
    );

    expect(convertViewPointToCameraPoint).toHaveBeenCalledTimes(2);
    expect(convertViewPointToCameraPoint).toHaveBeenNthCalledWith(1, { x: 1, y: 2 });
    expect(convertViewPointToCameraPoint).toHaveBeenNthCalledWith(2, { x: 3, y: 4 });
  });
});
