import { PhysicalCameraDeviceType } from 'react-native-vision-camera';

export const CAMERA_MODE = {
  PHOTO: 'photo',
  VIDEO: 'video',
  PORTRAIT: 'portrait',
  PANO: 'pano',
  SQUARE: 'square',
} as const;

// Flash modes
export const FLASH_MODE = {
  OFF: 'off',
  ON: 'on',
  AUTO: 'auto',
} as const;
export const flashModeOptions = Object.keys(FLASH_MODE).map(key => ({
  label: key,
  value: FLASH_MODE[key as keyof typeof FLASH_MODE],
}));

export const CAMERA_DEVICE = {
  TRIPLE: ['ultra-wide-angle-camera', 'wide-angle-camera', 'telephoto-camera'],
  DUAL_WIDE: ['ultra-wide-angle-camera', 'wide-angle-camera'],
  DUAL: ['wide-angle-camera', 'telephoto-camera'],
  WIDE_ANGLE: ['wide-angle-camera'],
  ULTRA_WIDE_ANGLE: ['ultra-wide-angle-camera'],
  TELEPHOTO: ['telephoto-camera'],
} as const;
export const cameraDeviceOptions = Object.keys(CAMERA_DEVICE).map(key => ({
  label: key,
  value: CAMERA_DEVICE[key as keyof typeof CAMERA_DEVICE] as unknown as PhysicalCameraDeviceType[],
}));

// Timer modes
export const TIMER_MODE = {
  OFF: 0,
  THREE_SECONDS: 3,
  TEN_SECONDS: 10,
} as const;

export const CAMERA_POSITION = {
  FRONT: 'front',
  BACK: 'back',
} as const;

// Type aliases
export type CameraMode = (typeof CAMERA_MODE)[keyof typeof CAMERA_MODE];
export type FlashMode = (typeof FLASH_MODE)[keyof typeof FLASH_MODE];
export type TimerMode = (typeof TIMER_MODE)[keyof typeof TIMER_MODE];
export type CameraPosition = (typeof CAMERA_POSITION)[keyof typeof CAMERA_POSITION];
