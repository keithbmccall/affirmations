import { renderHook } from '@testing-library/react-native';
import { useInputRef } from '../input';

describe('useInputRef', () => {
  it('returns a ref object with current property', () => {
    const { result } = renderHook(() => useInputRef('default'));
    expect(result.current).toHaveProperty('current');
  });

  it('returns a ref object that is stable between renders', () => {
    const { result, rerender } = renderHook(() => useInputRef('default'));
    const first = result.current;
    rerender();
    expect(result.current).toBe(first);
  });
});
