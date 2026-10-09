import type { ColorLensProcessor, ColorLensRegionPixels } from 'expo-color-lens-frame-processor';
import type { Frame } from 'react-native-vision-camera';
import { copyColorLensRegion, extractColorLensRegionColor } from './getColorLensRegion';

const mockCopyRegion = jest.fn();
const mockExtractDominantColor = jest.fn();

const mockProcessor = {
  copyRegion: (...args: unknown[]) => mockCopyRegion(...args),
  extractDominantColor: (...args: unknown[]) => mockExtractDominantColor(...args),
} as unknown as ColorLensProcessor;

const mockFrame = {} as Frame;

const regionOptions = {
  left: 10,
  top: 20,
  right: 30,
  bottom: 40,
};

const mockRegionPixels: ColorLensRegionPixels = {
  pixels: new ArrayBuffer(16),
  width: 2,
  height: 2,
};

describe('getColorLensRegion', () => {
  beforeEach(() => {
    mockCopyRegion.mockReset();
    mockExtractDominantColor.mockReset();
  });

  describe('copyColorLensRegion', () => {
    it('calls copyRegion with frame and pixel rect', () => {
      mockCopyRegion.mockReturnValue(mockRegionPixels);

      const result = copyColorLensRegion(mockProcessor, mockFrame, regionOptions);

      expect(mockCopyRegion).toHaveBeenCalledWith(
        mockFrame,
        regionOptions.left,
        regionOptions.top,
        regionOptions.right,
        regionOptions.bottom
      );
      expect(result).toBe(mockRegionPixels);
    });

    it('returns null when copyRegion returns undefined', () => {
      mockCopyRegion.mockReturnValue(undefined);

      expect(copyColorLensRegion(mockProcessor, mockFrame, regionOptions)).toBeNull();
    });
  });

  describe('extractColorLensRegionColor', () => {
    it('calls extractDominantColor with region pixels', () => {
      mockExtractDominantColor.mockReturnValue('#AABBCC');

      const result = extractColorLensRegionColor(mockProcessor, mockRegionPixels);

      expect(mockExtractDominantColor).toHaveBeenCalledWith(
        mockRegionPixels.pixels,
        mockRegionPixels.width,
        mockRegionPixels.height
      );
      expect(result).toBe('#AABBCC');
    });

    it('returns null when extractDominantColor returns undefined', () => {
      mockExtractDominantColor.mockReturnValue(undefined);

      expect(extractColorLensRegionColor(mockProcessor, mockRegionPixels)).toBeNull();
    });
  });
});
