import { useAnimatedColor } from '@features/Lens/ColorPalette/useAnimatedColor';
import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';
import { useSharedValue } from 'react-native-reanimated';

import { getRegionDiameter } from './lensPointSampleRegion';
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

    render(<LensColorRegionIndicator color={color} animationDuration={500} />);

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

  it('sizes the circle from the short layout side and sample radius', () => {
    const color = useSharedValue('#112233');

    render(<LensColorRegionIndicator color={color} animationDuration={500} />);

    fireEvent(screen.getByTestId('lens-color-region-indicator-container'), 'layout', {
      nativeEvent: { layout: { width: 400, height: 800, x: 0, y: 0 } },
    });

    const indicator = screen.getByTestId('lens-color-region-indicator');
    const flattenedStyle = Array.isArray(indicator.props.style)
      ? Object.assign({}, ...indicator.props.style.filter(Boolean))
      : indicator.props.style;

    const expectedDiameter = getRegionDiameter({ x: 0, y: 0, width: 400, height: 800 });

    expect(flattenedStyle).toEqual(
      expect.objectContaining({
        width: expectedDiameter,
        height: expectedDiameter,
        borderRadius: expectedDiameter / 2,
        borderWidth: 7,
        backgroundColor: 'transparent',
      })
    );
    expect(screen.getByTestId('lens-color-region-hair-h')).toBeTruthy();
    expect(screen.getByTestId('lens-color-region-hair-v')).toBeTruthy();
    expect(mockUseAnimatedColor).toHaveBeenCalledWith(color, 500);
  });

  it('does not render the circle until layout is measured', () => {
    const color = useSharedValue('#112233');

    render(<LensColorRegionIndicator color={color} animationDuration={500} />);

    expect(screen.queryByTestId('lens-color-region-indicator')).toBeNull();
    expect(screen.queryByTestId('lens-color-region-hair-h')).toBeNull();
    expect(screen.queryByTestId('lens-color-region-hair-v')).toBeNull();
  });
});
