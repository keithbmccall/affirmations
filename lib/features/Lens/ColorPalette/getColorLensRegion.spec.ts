import type { Frame } from 'react-native-vision-camera';
import { getColorLensRegion } from './getColorLensRegion';

const mockRegionPluginCall = jest.fn();

jest.mock('./colorLensRegionFrameProcessorPlugin', () => ({
  colorLensRegionFrameProcessorPlugin: {
    call: (...args: unknown[]) => mockRegionPluginCall(...args),
  },
}));

const mockFrame = {} as Frame;

const regionOptions = {
  centerX: 0.5,
  centerY: 0.5,
  radius: 0.15,
};

describe('getColorLensRegion', () => {
  beforeEach(() => {
    mockRegionPluginCall.mockReset();
  });

  it('calls the getColorLensRegion plugin with frame and options', () => {
    mockRegionPluginCall.mockReturnValue('#AABBCC');

    const result = getColorLensRegion(mockFrame, regionOptions);

    expect(mockRegionPluginCall).toHaveBeenCalledWith(mockFrame, regionOptions);
    expect(result).toBe('#AABBCC');
  });

  it('returns null when the plugin returns null', () => {
    mockRegionPluginCall.mockReturnValue(null as unknown as string);

    expect(getColorLensRegion(mockFrame, regionOptions)).toBeNull();
  });
});
