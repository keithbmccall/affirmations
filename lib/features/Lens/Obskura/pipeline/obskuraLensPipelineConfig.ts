import type { ObskuraLensPipelineStep } from '@features/Lens/Obskura/pipeline/obskuraLensPipelineTypes';

/**
 * All Obskura lens tuning lives here. Preview and still export share this pipeline via
 * `buildObskuraLensPaintFromPipeline`.
 */
export const OBSKURA_LENS_PIPELINE: ObskuraLensPipelineStep[] = [
  { action: 'erode', settings: { erodeRadius: 0 } },
  { action: 'blur', settings: { sigma: 60, referenceShortSide: 1080 } },
  { action: 'toneCurve', settings: { shadowLift: 0.1, highlightPull: 0.1 } },
  { action: 'brightness', settings: { value: -0.01 } },
  { action: 'contrast', settings: { value: 2.0 } },
  { action: 'saturation', settings: { value: 6 } },
];

const blurStep = OBSKURA_LENS_PIPELINE.find(
  (step): step is Extract<ObskuraLensPipelineStep, { action: 'blur' }> => step.action === 'blur'
);

if (blurStep === undefined) {
  throw new Error('OBSKURA_LENS_PIPELINE must include a blur step');
}

/**
 * Blur strength (Gaussian sigma) at {@link OBSKURA_LENS_BLUR_REFERENCE_SHORT_SIDE}.
 * Higher = heavier preview + more GPU work per frame.
 * If the app gets hot or crashes in Obskura mode, lower this in `OBSKURA_LENS_PIPELINE` before changing FPS.
 */
export const OBSKURA_LENS_BLUR_SIGMA = blurStep.settings.sigma;

/**
 * Short-side length (px) that {@link OBSKURA_LENS_BLUR_SIGMA} is tuned for. Live preview
 * runs at roughly HD-class frame sizes; full-res stills are larger, so export scales
 * sigma by `outputShortSide / this` so blur matches preview intensity.
 */
export const OBSKURA_LENS_BLUR_REFERENCE_SHORT_SIDE = blurStep.settings.referenceShortSide ?? 1080;
