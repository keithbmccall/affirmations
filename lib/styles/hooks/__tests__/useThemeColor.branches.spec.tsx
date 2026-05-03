import { Colors } from '@components/defaults/constants/Colors';
import { renderHook } from '@testing-library/react-native';
import { useThemeColor } from '../useThemeColor';

const mockUseColorScheme = jest.fn(() => 'light' as const | null);

jest.mock('../useColorScheme', () => ({
  useColorScheme: () => mockUseColorScheme(),
}));

describe('useThemeColor branches', () => {
  it('prefers explicit colors when provided', () => {
    mockUseColorScheme.mockReturnValueOnce('dark');
    const { result } = renderHook(() =>
      useThemeColor({ light: '#ff00ff', dark: '#00ffff' }, 'background')
    );
    expect(result.current).toBe('#00ffff');
  });

  it('falls back to palette colors when props omit the active theme', () => {
    mockUseColorScheme.mockReturnValueOnce('light');
    const { result } = renderHook(() => useThemeColor({}, 'text'));
    expect(result.current).toBe(Colors.light.text);
  });

  it('treats a null color scheme as light', () => {
    mockUseColorScheme.mockReturnValueOnce(null);
    const { result } = renderHook(() => useThemeColor({}, 'background'));
    expect(result.current).toBe(Colors.light.background);
  });
});
