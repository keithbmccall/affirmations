# Color Lens Processor — limitations and guardrails

Handoff for engineers and agents working on [`expo-color-lens-frame-processor`](./). End-to-end lens-point flow lives in [`lib/features/Lens/LENS_POINT_CONTEXT.md`](../../lib/features/Lens/LENS_POINT_CONTEXT.md).

---

## Thread safety / re-entrancy

`HybridColorLensProcessor` is a **long-lived Nitro singleton** (`getColorLensProcessor()`).

Shared **mutable** state on one instance:

- `pixelBuffer`, `histogram`
- Palette slot cache / `previousPaletteRGB`, `previousRegionRGB`
- Throttle timestamps

**Safe:** Sequential use on the Vision Camera frame thread. Only one mode runs per frame (`switch` in `onFrame`). Call `extractRegionColor` or `extractFramePalette`, then dispose the camera `Frame`.

**Unsafe:** Parallel native calls on the same instance (e.g. two worklets or a merged API without serialization). Do not add concurrent entry points without per-call buffers or an explicit lock.

---

## Pixel layout contract

Product MMCQ input is **interleaved RGB** (`N × 3` bytes), produced by **`ColorLensYUVSampler`** from the camera `CVPixelBuffer`:

| API | Source |
|-----|--------|
| `extractFramePalette` | Viewport cover-crop rect → YUV strided sample |
| `extractRegionColor` | Lens-point sample square → YUV strided sample |

Supported buffer format: Vision Camera `pixelFormat: 'yuv'` → `kCVPixelFormatType_420YpCbCr8BiPlanarFullRange`. Matrix from `kCVImageBufferYCbCrMatrixKey` (BT.601 / BT.709). Display P3 primaries are converted to sRGB when present.

**MMCQ must not consume BGRA or YUV directly.** Sampling always packs RGB first.

---

## Buffer lifetime

- Each entry point locks the camera `CVPixelBuffer` **read-only** for the duration of the YUV→RGB sample + MMCQ.
- JS holds the camera `Frame` for that single native call, then **`frame.dispose()`** in a `finally` block.
- Do not retain the `Frame` across async JS.

---

## Platform

- iOS-only HybridObject (`HybridObject<{ ios: 'swift' }>`).
- Swift changes require a **dev client rebuild** (`npx expo run:ios`) — not EAS Update / Metro alone.
- Android native implementation is out of scope.

---

## UI vs native geometry (lens-point)

- On-screen indicator: **circular ring** (diameter = sample square side).
- Native sample: **axis-aligned square** from `getLensPointSampleRect` → VC5 → `extractRegionColor`.
- Corner pixels of the square are analyzed but not outlined. This is intentional; not a coordinate bug.

---

## Performance and quality guardrails

Do not change in drive-by PRs without profiling and product sign-off:

| Constant | Role |
|----------|------|
| JS palette **2 FPS** / region **10 FPS** | [`LensCameraSurface.tsx`](../../lib/features/Lens/Camera/LensCameraSurface.tsx) |
| Color animation **150 ms**, ease-out cubic | [`useAnimatedColor.ts`](../../lib/features/Lens/ColorPalette/useAnimatedColor.ts) |
| Native `minProcessingInterval` 0.05s | ~20 FPS cap per entry point |
| `maxImageSize` 128 | Virtual grid long side before strided sample |
| `defaultQuality` 15 | Histogram / sample stride on the virtual grid |
| `stabilityThreshold` 900 | Temporal smoothing (RGB distance²) |

Raising sample rates or lowering `quality` / resolution changes UX and battery; profile first.

---

## Related files

| Concern | Path |
|---------|------|
| Processor | [`ios/HybridColorLensProcessor.swift`](ios/HybridColorLensProcessor.swift) |
| YUV sampler | [`ios/ColorLensYUVSampler.swift`](ios/ColorLensYUVSampler.swift) |
| MMCQ | [`ios/ColorLensMMCQ.swift`](ios/ColorLensMMCQ.swift) |
| Nitro spec | [`src/specs/ColorLensProcessor.nitro.ts`](src/specs/ColorLensProcessor.nitro.ts) |
| JS region bridge | [`lib/features/Lens/ColorPalette/getColorLensRegion.ts`](../../lib/features/Lens/ColorPalette/getColorLensRegion.ts) |
| JS palette bridge | [`lib/features/Lens/ColorPalette/getColorLensPalette.ts`](../../lib/features/Lens/ColorPalette/getColorLensPalette.ts) |
