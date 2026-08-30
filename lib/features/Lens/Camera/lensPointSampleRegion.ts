import type { LayoutRectangle } from 'react-native';

export const LENS_POINT_REGION = {
  /** Normalized radius (0–1) — native square crop + inner ring diameter */
  sampleRadius: 0.01,
  /** UI-only: outer halo = sampleRadius × multiplier */
  haloMultiplier: 8,
  innerBorderWidth: 1,
  haloBorderWidth: 2,
  haloBorderOpacity: 0.4,
} as const;

/** Normalized radius (0–1) of the sample patch — shared by native plugin and on-screen ring. */
export const LENS_POINT_SAMPLE_RADIUS = LENS_POINT_REGION.sampleRadius;

/** UI-only scale for the outer halo (thumb-friendly aim size; does not affect native sampling). */
export const LENS_POINT_HALO_MULTIPLIER = LENS_POINT_REGION.haloMultiplier;

export const LENS_POINT_HALO_RADIUS = LENS_POINT_REGION.sampleRadius * LENS_POINT_REGION.haloMultiplier;

/** Diameter in px: same fraction of viewport short side as the native square crop. */
export function getRegionDiameter(layoutSize: LayoutRectangle): number {
  const shortSide = Math.min(layoutSize.width, layoutSize.height);
  if (shortSide <= 0) {
    return 0;
  }
  return 2 * LENS_POINT_REGION.sampleRadius * shortSide;
}

/** Diameter in px for the outer visibility halo (UI only). */
export function getRegionHaloDiameter(layoutSize: LayoutRectangle): number {
  const shortSide = Math.min(layoutSize.width, layoutSize.height);
  if (shortSide <= 0) {
    return 0;
  }
  return 2 * LENS_POINT_HALO_RADIUS * shortSide;
}
