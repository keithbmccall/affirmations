/** String values matching `expo-media-library` `MediaType` enum (avoids importing the package root in callers). */
export const CAMERA_ROLL_MEDIA_TYPE = {
  IMAGE: 'image',
  VIDEO: 'video',
} as const;

export type CameraRollMediaTypeFilter =
  (typeof CAMERA_ROLL_MEDIA_TYPE)[keyof typeof CAMERA_ROLL_MEDIA_TYPE];
