// Reexport the native module. On web, it will be resolved to ColorLensFrameProcessorModule.web.ts
// and on native platforms to ColorLensFrameProcessorModule.ts
export { default } from './src/ColorLensFrameProcessor';
export * from './src/ColorLensFrameProcessor.types';
