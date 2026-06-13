import type { ObskuraColorMode } from '@features/Lens/Obskura/options';

export interface ErodeStepSettings {
  erodeRadius: number;
}

export interface BlurStepSettings {
  sigma: number;
  referenceShortSide?: number;
}

export interface ToneCurveStepSettings {
  shadowLift: number;
  highlightPull: number;
}

export interface BrightnessStepSettings {
  value: number;
}

export interface ContrastStepSettings {
  value: number;
}

export interface SaturationStepSettings {
  value: number;
}

export type ObskuraLensPipelineStep =
  | { action: 'erode'; settings: ErodeStepSettings }
  | { action: 'blur'; settings: BlurStepSettings }
  | { action: 'toneCurve'; settings: ToneCurveStepSettings }
  | { action: 'brightness'; settings: BrightnessStepSettings }
  | { action: 'contrast'; settings: ContrastStepSettings }
  | { action: 'saturation'; settings: SaturationStepSettings };

export interface BuildObskuraLensPipelineContext {
  colorMode: ObskuraColorMode;
  /** When set (e.g. still width/height min), blur sigma is scaled vs the blur step's referenceShortSide. */
  outputShortSidePx?: number;
}
