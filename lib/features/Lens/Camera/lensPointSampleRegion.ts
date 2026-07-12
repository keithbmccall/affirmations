import type { LayoutRectangle } from 'react-native';

export const LENS_POINT_SAMPLE_RADIUS = 0.01;

const RADIUS_MULTIPLIER = 8;

export function getRegionDiameter(layoutSize: LayoutRectangle): number {
  const shortSide = Math.min(layoutSize.width, layoutSize.height);
  if (shortSide <= 0) {
    return 0;
  }
  return 2 * LENS_POINT_SAMPLE_RADIUS * RADIUS_MULTIPLIER * shortSide;
}
