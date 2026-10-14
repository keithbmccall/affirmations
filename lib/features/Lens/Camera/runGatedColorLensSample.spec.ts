import type { SharedValue } from 'react-native-reanimated';
import type { Frame } from 'react-native-vision-camera';

import { runGatedColorLensSample } from './runGatedColorLensSample';

const createSharedNumber = (initial: number): SharedValue<number> =>
  ({ value: initial }) as SharedValue<number>;

const createMockFrame = (): Frame =>
  ({
    convertCameraPointToFramePoint: ({ x, y }: { x: number; y: number }) => ({ x, y }),
    dispose: jest.fn(),
  }) as unknown as Frame;

describe('runGatedColorLensSample', () => {
  beforeEach(() => {
    global.__frameProcessorRunAtTargetFpsMap = undefined;
    jest.spyOn(performance, 'now').mockReturnValue(10_000);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('skips apply when ready is not 1', () => {
    const apply = jest.fn();
    runGatedColorLensSample(createMockFrame(), {
      ready: createSharedNumber(0),
      x1: createSharedNumber(0),
      y1: createSharedNumber(0),
      x2: createSharedNumber(10),
      y2: createSharedNumber(20),
      fpsKey: 'test-gated',
      targetFps: 1,
      apply,
    });
    expect(apply).not.toHaveBeenCalled();
  });

  it('applies frame bounds when ready and FPS allows', () => {
    const apply = jest.fn();
    const frame = createMockFrame();
    runGatedColorLensSample(frame, {
      ready: createSharedNumber(1),
      x1: createSharedNumber(10),
      y1: createSharedNumber(20),
      x2: createSharedNumber(100),
      y2: createSharedNumber(80),
      fpsKey: 'test-gated',
      targetFps: 1,
      apply,
    });
    expect(apply).toHaveBeenCalledWith(frame, {
      left: 10,
      top: 20,
      right: 100,
      bottom: 80,
    });
  });

  it('skips apply when FPS throttle denies the call', () => {
    const apply = jest.fn();
    const options = {
      ready: createSharedNumber(1),
      x1: createSharedNumber(0),
      y1: createSharedNumber(0),
      x2: createSharedNumber(1),
      y2: createSharedNumber(1),
      fpsKey: 'test-gated',
      targetFps: 1,
      apply,
    };

    runGatedColorLensSample(createMockFrame(), options);
    expect(apply).toHaveBeenCalledTimes(1);

    jest.spyOn(performance, 'now').mockReturnValue(10_500);
    runGatedColorLensSample(createMockFrame(), options);
    expect(apply).toHaveBeenCalledTimes(1);
  });
});
