import { scheduleDeferredSkPaintDispose } from './scheduleDeferredSkPaintDispose';

function flushDeferredSkPaintDispose() {
  jest.runOnlyPendingTimers();
  jest.runOnlyPendingTimers();
}

describe('scheduleDeferredSkPaintDispose', () => {
  const mockDispose = jest.fn();

  beforeEach(() => {
    mockDispose.mockClear();
    jest.useFakeTimers();
    jest.spyOn(global, 'requestAnimationFrame').mockImplementation(callback => {
      return setTimeout(() => callback(0), 0) as unknown as number;
    });
    jest.spyOn(global, 'cancelAnimationFrame').mockImplementation(timerId => {
      clearTimeout(timerId);
    });
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('defers paint dispose until after two animation frames', () => {
    const paint = { dispose: mockDispose };

    scheduleDeferredSkPaintDispose(paint as never);

    expect(mockDispose).not.toHaveBeenCalled();
    flushDeferredSkPaintDispose();
    expect(mockDispose).toHaveBeenCalledTimes(1);
  });

  it('cancels pending dispose when cancel is called before it fires', () => {
    const paint = { dispose: mockDispose };

    const cancel = scheduleDeferredSkPaintDispose(paint as never);
    cancel();

    flushDeferredSkPaintDispose();
    expect(mockDispose).not.toHaveBeenCalled();
  });
});
