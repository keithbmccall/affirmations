import type { ColorLensProcessor } from 'expo-color-lens-frame-processor';
import type { Frame } from 'react-native-vision-camera';
import { getColorLensRegionColor } from './getColorLensRegion';

const mockExtractRegionColor = jest.fn();

const mockProcessor = {
  extractRegionColor: (...args: unknown[]) => mockExtractRegionColor(...args),
} as unknown as ColorLensProcessor;

const mockFrame = {} as Frame;

const regionOptions = {
  left: 10,
  top: 20,
  right: 30,
  bottom: 40,
};

describe('getColorLensRegion', () => {
  beforeEach(() => {
    mockExtractRegionColor.mockReset();
  });

  describe('getColorLensRegionColor', () => {
    it('calls extractRegionColor with frame and pixel rect', () => {
      mockExtractRegionColor.mockReturnValue('#AABBCC');

      const result = getColorLensRegionColor(mockProcessor, mockFrame, regionOptions);

      expect(mockExtractRegionColor).toHaveBeenCalledWith(
        mockFrame,
        regionOptions.left,
        regionOptions.top,
        regionOptions.right,
        regionOptions.bottom
      );
      expect(result).toBe('#AABBCC');
    });

    it('returns null when extractRegionColor returns undefined', () => {
      mockExtractRegionColor.mockReturnValue(undefined);

      expect(getColorLensRegionColor(mockProcessor, mockFrame, regionOptions)).toBeNull();
    });
  });
});
