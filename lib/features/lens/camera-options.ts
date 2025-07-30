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
  OFF: ['off', 'bolt.slash.fill'],
  ON: ['on', 'bolt.fill'],
  AUTO: ['auto', 'bolt.badge.automatic'],
} as const;
export const flashModeOptions = Object.keys(FLASH_MODE).map(key => ({
  label: key,
  icon: FLASH_MODE[key as keyof typeof FLASH_MODE][1],
  value: FLASH_MODE[key as keyof typeof FLASH_MODE][0],
}));

// Grid modes
export const GRID_MODE = {
  OFF: ['off', 'squareshape.split.2x2.dotted.inside'],
  ON: ['on', 'squareshape.split.2x2'],
} as const;
export const gridModeOptions = Object.keys(GRID_MODE).map(key => ({
  label: key,
  icon: GRID_MODE[key as keyof typeof GRID_MODE][1],
  value: GRID_MODE[key as keyof typeof GRID_MODE][0],
}));

export const CAMERA_DEVICE = {
  TRIPLE: ['ultra-wide-angle-camera', 'wide-angle-camera', 'telephoto-camera'],
  DUAL_WIDE: ['ultra-wide-angle-camera', 'wide-angle-camera'],
  DUAL: ['wide-angle-camera', 'telephoto-camera'],
  // WIDE_ANGLE: ['wide-angle-camera'],
  // ULTRA_WIDE_ANGLE: ['ultra-wide-angle-camera'],
  // TELEPHOTO: ['telephoto-camera'],
} as const;
export const cameraDeviceOptions = Object.keys(CAMERA_DEVICE).map(key => ({
  label: key,
  value: CAMERA_DEVICE[key as keyof typeof CAMERA_DEVICE] as unknown as PhysicalCameraDeviceType[],
}));

// Timer modes
export const TIMER_MODE = {
  OFF: ['off', 'timer'],
  THREE_SECONDS: ['3s', 'timer.3s'],
  TEN_SECONDS: ['10s', 'timer.10s'],
} as const;
export const timerModeOptions = Object.keys(TIMER_MODE).map(key => ({
  label: key,
  icon: TIMER_MODE[key as keyof typeof TIMER_MODE][1],
  value: TIMER_MODE[key as keyof typeof TIMER_MODE][0],
}));

export const CAMERA_POSITION = {
  FRONT: 'front',
  BACK: 'back',
} as const;

// Type aliases
export type CameraMode = (typeof CAMERA_MODE)[keyof typeof CAMERA_MODE];
export type FlashMode = (typeof FLASH_MODE)[keyof typeof FLASH_MODE];
export type GridMode = (typeof GRID_MODE)[keyof typeof GRID_MODE];
export type TimerMode = (typeof TIMER_MODE)[keyof typeof TIMER_MODE];
export type CameraPosition = (typeof CAMERA_POSITION)[keyof typeof CAMERA_POSITION];
