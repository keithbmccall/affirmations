import { createAssetAsync } from 'expo-media-library';

export async function saveVideoRecording(
  video: { path: string },
  fetchRecentMedia: () => Promise<void>
): Promise<void> {
  await createAssetAsync(video.path);
  await fetchRecentMedia();
}
