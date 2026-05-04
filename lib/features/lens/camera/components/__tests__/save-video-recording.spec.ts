import { saveVideoRecording } from '@features/lens/camera/components/save-video-recording';
import * as MediaLibrary from 'expo-media-library';

describe('saveVideoRecording', () => {
  it('persists the recording then refreshes recent media', async () => {
    const createSpy = jest.spyOn(MediaLibrary, 'createAssetAsync').mockResolvedValue({} as never);
    const fetchRecent = jest.fn();
    await saveVideoRecording({ path: '/tmp/video.mp4' }, fetchRecent);
    expect(createSpy).toHaveBeenCalledWith('/tmp/video.mp4');
    expect(fetchRecent).toHaveBeenCalled();
    createSpy.mockRestore();
  });
});
