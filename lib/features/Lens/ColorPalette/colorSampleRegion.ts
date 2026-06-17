export const ColorSampleRegion = {
  SMALL: 'SMALL',
  LARGE: 'LARGE',
} as const;
export type ColorSampleRegion = (typeof ColorSampleRegion)[keyof typeof ColorSampleRegion];

const COLOR_SAMPLE_REGION_RADIUS: Record<ColorSampleRegion, number> = {
  [ColorSampleRegion.SMALL]: 0.15,
  [ColorSampleRegion.LARGE]: 0.25,
};

export function colorSampleRegionToRadius(region: ColorSampleRegion): number {
  return COLOR_SAMPLE_REGION_RADIUS[region];
}
