import { getResizerOutputSize } from './resizerOutputSize';

describe('getResizerOutputSize', () => {
  it('returns a square fallback when viewport size is invalid', () => {
    expect(getResizerOutputSize(0, 0)).toEqual({ width: 128, height: 128 });
    expect(getResizerOutputSize(-1, 100)).toEqual({ width: 128, height: 128 });
  });

  it('keeps viewport aspect with long side 128 for landscape', () => {
    expect(getResizerOutputSize(390, 200)).toEqual({ width: 128, height: 66 });
  });

  it('keeps viewport aspect with long side 128 for portrait', () => {
    expect(getResizerOutputSize(390, 844)).toEqual({ width: 59, height: 128 });
  });
});
