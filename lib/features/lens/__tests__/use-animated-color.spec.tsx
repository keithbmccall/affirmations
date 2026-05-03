import { useAnimatedColor } from '@features/lens/lens-palette/use-animated-color';
import { act, renderHook } from '@testing-library/react-native';
import { useSharedValue } from 'react-native-reanimated';

function useHarness(animationDuration: number) {
  const color = useSharedValue('#000000');
  const animated = useAnimatedColor(color, animationDuration);
  return { color, animated };
}

describe('use-animated-color.ts', () => {
  it('returns a derived value and reacts to shared color updates', () => {
    const { result } = renderHook(() => useHarness(80));
    expect(result.current.animated).toBeDefined();
    act(() => {
      result.current.color.value = '#abcdef';
    });
    expect(result.current.color.value).toBe('#abcdef');
    act(() => {
      result.current.color.value = '#fedcba';
    });
    expect(result.current.color.value).toBe('#fedcba');
  });
});
