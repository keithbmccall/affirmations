import type { HybridObject } from 'react-native-nitro-modules';
import type { Frame } from 'react-native-vision-camera';

export interface ColorLensRegionPlugin
  extends HybridObject<{ ios: 'swift'; android: 'kotlin' }> {
  call(
    frame: Frame,
    centerX: number,
    centerY: number,
    radius: number,
    viewportWidth: number,
    viewportHeight: number
  ): string | undefined;
}
