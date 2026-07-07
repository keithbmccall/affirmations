import { useAnimatedColor } from '@features/Lens/ColorPalette/useAnimatedColor';
import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';
import { useSharedValue } from 'react-native-reanimated';

import { LensColorRegionIndicator } from './LensColorRegionIndicator';

jest.mock('@features/Lens/ColorPalette/useAnimatedColor', () => ({
  useAnimatedColor: jest.fn(() => ({ value: '#AABBCC' })),
}));

const mockUseAnimatedColor = jest.mocked(useAnimatedColor);

describe('LensColorRegionIndicator', () => {
  beforeEach(() => {
    mockUseAnimatedColor.mockClear();
  });

  it('uses absolute fill positioning on the overlay container', () => {
    const color = useSharedValue('#112233');

    render(<LensColorRegionIndicator color={color} radius={0.08} animationDuration={500} />);

    const container = screen.getByTestId('lens-color-region-indicator-container');
    const flattenedStyle = Array.isArray(container.props.style)
      ? Object.assign({}, ...container.props.style.filter(Boolean))
      : container.props.style;

    expect(flattenedStyle).toEqual(
      expect.objectContaining({
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 5,
      })
    );
  });

  it('sizes the circle from the short layout side and normalized radius', () => {
    const color = useSharedValue('#112233');

    render(
      <LensColorRegionIndicator color={color} radius={0.15} animationDuration={500} />
    );

    fireEvent(screen.getByTestId('lens-color-region-indicator-container'), 'layout', {
      nativeEvent: { layout: { width: 400, height: 800, x: 0, y: 0 } },
    });

    const indicator = screen.getByTestId('lens-color-region-indicator');
    const flattenedStyle = Array.isArray(indicator.props.style)
      ? Object.assign({}, ...indicator.props.style.filter(Boolean))
      : indicator.props.style;

    expect(flattenedStyle).toEqual(
      expect.objectContaining({
        width: 120,
        height: 120,
        borderRadius: 60,
      })
    );
    expect(mockUseAnimatedColor).toHaveBeenCalledWith(color, 500);
  });

  it('does not render the circle until layout is measured', () => {
    const color = useSharedValue('#112233');

    render(
      <LensColorRegionIndicator color={color} radius={0.15} animationDuration={500} />
    );

    expect(screen.queryByTestId('lens-color-region-indicator')).toBeNull();
  });
});
