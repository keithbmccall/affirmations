import { createAssetAsync } from 'expo-media-library';

export async function finishCameraVideoRecording(
  video: { path: string },
  fetchRecentMedia: () => void | Promise<void>
): Promise<void> {
  await createAssetAsync(video.path);
  await Promise.resolve(fetchRecentMedia());
}
