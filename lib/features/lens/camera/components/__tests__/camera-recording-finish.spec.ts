import { finishCameraVideoRecording } from '@features/lens/camera/components/camera-recording-finish';
import * as MediaLibrary from 'expo-media-library';

describe('finishCameraVideoRecording', () => {
  it('persists the recording then refreshes recent media', async () => {
    const createSpy = jest.spyOn(MediaLibrary, 'createAssetAsync').mockResolvedValue({} as never);
    const fetchRecent = jest.fn();
    await finishCameraVideoRecording({ path: '/tmp/video.mp4' }, fetchRecent);
    expect(createSpy).toHaveBeenCalledWith('/tmp/video.mp4');
    expect(fetchRecent).toHaveBeenCalled();
    createSpy.mockRestore();
  });
});
