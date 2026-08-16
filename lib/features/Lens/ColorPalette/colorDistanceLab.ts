export type LabColor = {
  L: number;
  a: number;
  b: number;
};

export type RgbColor = {
  r: number;
  g: number;
  b: number;
};

const srgbChannelToLinear = (channel: number): number => {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};

const xyzToLabChannel = (t: number): number => {
  const delta = 6 / 29;
  return t > delta ** 3 ? Math.cbrt(t) : t / (3 * delta ** 2) + 4 / 29;
};

export const hexToRgb = (hex: string): RgbColor => {
  const value = hex.replace(/^#/, '').toLowerCase();
  if (value.length !== 6) {
    throw new Error(`Invalid hex color: ${hex}`);
  }

  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16),
  };
};

/** sRGB (0–255) → CIE Lab (D65). */
export const rgbToLab = ({ r, g, b }: RgbColor): LabColor => {
  const R = srgbChannelToLinear(r);
  const G = srgbChannelToLinear(g);
  const B = srgbChannelToLinear(b);

  const x = (0.4124564 * R + 0.3575761 * G + 0.1804375 * B) / 0.95047;
  const y = (0.2126729 * R + 0.7151522 * G + 0.072175 * B) / 1;
  const z = (0.0193339 * R + 0.119192 * G + 0.9503041 * B) / 1.08883;

  const fx = xyzToLabChannel(x);
  const fy = xyzToLabChannel(y);
  const fz = xyzToLabChannel(z);

  return {
    L: 116 * fy - 16,
    a: 500 * (fx - fy),
    b: 200 * (fy - fz),
  };
};

export const hexToLab = (hex: string): LabColor => rgbToLab(hexToRgb(hex));

/** CIE76 Delta E between two Lab colors. */
export const deltaE76 = (labA: LabColor, labB: LabColor): number => {
  const dL = labA.L - labB.L;
  const da = labA.a - labB.a;
  const db = labA.b - labB.b;
  return Math.sqrt(dL * dL + da * da + db * db);
};
