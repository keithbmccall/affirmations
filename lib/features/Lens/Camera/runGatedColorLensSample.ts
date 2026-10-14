import type { SharedValue } from 'react-native-reanimated';
import type { Frame } from 'react-native-vision-camera';

import {
  frameBoundsFromCameraCorners,
  type FrameBounds,
} from './frameBoundsFromCameraCorners';
import { shouldRunAtTargetFps } from './shouldRunAtTargetFps';

export interface RunGatedColorLensSampleOptions {
  ready: SharedValue<number>;
  x1: SharedValue<number>;
  y1: SharedValue<number>;
  x2: SharedValue<number>;
  y2: SharedValue<number>;
  fpsKey: string;
  targetFps: number;
  apply: (frame: Frame, bounds: FrameBounds) => void;
}

/**
 * Gate on camera-rect readiness, throttle to target FPS, then convert corners
 * and invoke `apply`. Gate before throttle so "preview not ready" frames do
 * not consume the FPS budget.
 */
export function runGatedColorLensSample(
  frame: Frame,
  options: RunGatedColorLensSampleOptions
): void {
  'worklet';
  if (options.ready.value !== 1) {
    return;
  }
  if (!shouldRunAtTargetFps(options.fpsKey, options.targetFps)) {
    return;
  }
  options.apply(
    frame,
    frameBoundsFromCameraCorners(
      frame,
      { x: options.x1.value, y: options.y1.value },
      { x: options.x2.value, y: options.y2.value }
    )
  );
}
