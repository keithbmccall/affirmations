import { useAnimatedColor } from '@features/Lens/ColorPalette/useAnimatedColor';
import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';
import { useSharedValue } from 'react-native-reanimated';

import { getLensPointSampleRect, LENS_POINT_REGION } from './lensPointSampleRegion';
import { LensColorRegionIndicator } from './LensColorRegionIndicator';

jest.mock('@features/Lens/ColorPalette/useAnimatedColor', () => ({
  useAnimatedColor: jest.fn(() => ({ value: '#AABBCC' })),
}));

const mockUseAnimatedColor = jest.mocked(useAnimatedColor);

const layout = { x: 0, y: 0, width: 400, height: 800 };

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

  it('renders a sample ring matching getLensPointSampleRect from layout short side', () => {
    const color = useSharedValue('#112233');

    render(<LensColorRegionIndicator color={color} animationDuration={500} />);

    fireEvent(screen.getByTestId('lens-color-region-indicator-container'), 'layout', {
      nativeEvent: { layout },
    });

    const expected = getLensPointSampleRect(layout);

    const indicator = screen.getByTestId('lens-color-region-indicator');
    const indicatorStyle = Array.isArray(indicator.props.style)
      ? Object.assign({}, ...indicator.props.style.filter(Boolean))
      : indicator.props.style;

    expect(indicatorStyle).toEqual(
      expect.objectContaining({
        width: expected.size,
        height: expected.size,
        borderRadius: expected.size / 2,
        borderWidth: LENS_POINT_REGION.borderWidth,
        backgroundColor: 'transparent',
      })
    );
    expect(mockUseAnimatedColor).toHaveBeenCalledWith(color, 500);
  });

  it('does not render the sample ring until layout is measured', () => {
    const color = useSharedValue('#112233');

    render(<LensColorRegionIndicator color={color} animationDuration={500} />);

    expect(screen.queryByTestId('lens-color-region-indicator')).toBeNull();
  });
});
