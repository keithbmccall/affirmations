# Color Lens Processor — limitations and guardrails

Handoff for engineers and agents working on [`expo-color-lens-frame-processor`](./). Live camera path uses dominant palette sampling via `extractFramePalette` only.

---

## Thread safety / re-entrancy

`HybridColorLensProcessor` is a **long-lived Nitro singleton** (`getColorLensProcessor()`).

Shared **mutable** state on one instance:

- `pixelBuffer`, `histogram`
- Palette slot cache / `previousPaletteRGB`
- Throttle timestamps

**Safe:** Sequential use on the Vision Camera frame thread. Call `extractFramePalette`, then dispose the camera `Frame`.

**Unsafe:** Parallel native calls on the same instance (e.g. two worklets or a merged API without serialization). Do not add concurrent entry points without per-call buffers or an explicit lock.

---

## Pixel layout contract

Product MMCQ input is **interleaved RGB** (`N × 3` bytes), produced by **`ColorLensYUVSampler`** from the camera `CVPixelBuffer`:

| API | Source |
|-----|--------|
| `extractFramePalette` | Viewport cover-crop rect → YUV strided sample |

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

## Performance and quality guardrails

Do not change in drive-by PRs without profiling and product sign-off:

| Constant | Role |
|----------|------|
| JS palette **2 FPS** | [`LensCameraSurface.tsx`](../../lib/features/Lens/Camera/LensCameraSurface.tsx) |
| Color animation **150 ms**, ease-out cubic | [`useAnimatedColor.ts`](../../lib/features/Lens/ColorPalette/useAnimatedColor.ts) |
| Native `minProcessingInterval` 0.05s | ~20 FPS cap per entry point |
