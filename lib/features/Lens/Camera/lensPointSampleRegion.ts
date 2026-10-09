import type { LayoutRectangle } from 'react-native';

export const LENS_POINT_REGION = {
  /** Normalized radius (0–1) — view-space sample square + on-screen indicator (1:1) */
  sampleRadius: 0.04,
  borderWidth: 1,
} as const;

/** Normalized radius (0–1) of the sample patch — shared by native crop and on-screen square. */
export const LENS_POINT_SAMPLE_RADIUS = LENS_POINT_REGION.sampleRadius;

export interface LensPointSampleRect {
  x: number;
  y: number;
  size: number;
}

/** Centered view-space sample square (same geometry for indicator + VC5 corner conversion). */
export function getLensPointSampleRect(layoutSize: LayoutRectangle): LensPointSampleRect {
  const shortSide = Math.min(layoutSize.width, layoutSize.height);
  if (shortSide <= 0) {
    return { x: 0, y: 0, size: 0 };
  }

  const size = 2 * LENS_POINT_REGION.sampleRadius * shortSide;
  return {
    x: layoutSize.width / 2 - size / 2,
    y: layoutSize.height / 2 - size / 2,
    size,
  };
}

/** Side length in px of the sample square (alias of `getLensPointSampleRect(...).size`). */
export function getRegionDiameter(layoutSize: LayoutRectangle): number {
  return getLensPointSampleRect(layoutSize).size;
}
