# Color Lens Processor — limitations and guardrails

Handoff for engineers and agents working on [`expo-color-lens-frame-processor`](./). End-to-end lens-point flow lives in [`lib/features/Lens/LENS_POINT_CONTEXT.md`](../../lib/features/Lens/LENS_POINT_CONTEXT.md).

---

## Thread safety / re-entrancy

`HybridColorLensProcessor` is a **long-lived Nitro singleton** (`getColorLensProcessor()`).

Shared **mutable** state on one instance:

- `pixelBuffer`, `bgraScratch`, `histogram`
- `paletteResultCache`, `previousPaletteRGB`, `previousRegionRGB`
- Throttle timestamps

**Safe:** Sequential use on the Vision Camera frame thread, e.g. `copyRegion` → dispose camera `Frame` → `extractDominantColor` before the next frame; dominant `extractPalette` when not overlapping another entry point on the same instance.

**Unsafe:** Parallel native calls on the same instance (e.g. two worklets or a merged API without serialization). Do not add concurrent entry points without per-call buffers or an explicit lock.

---

## Pixel layout contract

Product MMCQ input is **interleaved RGB** (`width × height × 3` bytes):

| API | Source |
|-----|--------|
| `extractPalette` | GPU resizer (dominant mode) |
| `extractDominantColor` | `copyRegion` output (lens-point) |

Region path: Core Image renders **BGRA8** into `bgraScratch`, then packs to RGB in `pixelBuffer`. **MMCQ must not consume BGRA.** Do not reintroduce a second MMCQ reader without updating this doc and QA.

---

## Buffer lifetime

- `copyRegion` returns an **owned** `ArrayBuffer` copy of RGB pixels.
- JS must **dispose the camera `Frame`** before running MMCQ (`extractDominantColor`) so the camera buffer pool is not held.
- Do not retain region pixels across async JS without copying; `extractDominantColor` reads the buffer once per call.

---

## Platform

- iOS-only HybridObject (`HybridObject<{ ios: 'swift' }>`).
- Swift changes require a **dev client rebuild** (`npx expo run:ios`) — not EAS Update / Metro alone.
- Android native implementation is out of scope.

---

## UI vs native geometry (lens-point)

- On-screen indicator: **circular ring** (diameter = sample square side).
- Native sample: **axis-aligned square** from `getLensPointSampleRect` → VC5 → `copyRegion`.
- Corner pixels of the square are analyzed but not outlined. This is intentional; not a coordinate bug.

---

## Performance and quality guardrails

Do not change in drive-by PRs without profiling and product sign-off:

| Constant | Role |
|----------|------|
| JS palette ~1 FPS / region ~2 FPS | [`LensCameraSurface.tsx`](../../lib/features/Lens/Camera/LensCameraSurface.tsx) |
| Native `minProcessingInterval` 0.05s | ~20 FPS cap per entry point |
| `maxImageSize` 128 | Downsample before MMCQ |
| `defaultQuality` 15 | Histogram stride |
| `stabilityThreshold` 900 | Temporal smoothing (RGB distance²) |

**Known CPU follow-up:** merge `copyRegion` + `extractDominantColor` into one Nitro call to drop an extra buffer copy and Nitro hop (requires JS/worklet API change).

Raising sample rates or lowering `quality` / resolution changes UX and battery; profile first.

---

## Related files

| Concern | Path |
|---------|------|
| Processor | [`ios/HybridColorLensProcessor.swift`](ios/HybridColorLensProcessor.swift) |
| MMCQ | [`ios/ColorLensMMCQ.swift`](ios/ColorLensMMCQ.swift) |
| CI crop | [`ios/ColorLensImagePipeline.swift`](ios/ColorLensImagePipeline.swift) |
| Nitro spec | [`src/specs/ColorLensProcessor.nitro.ts`](src/specs/ColorLensProcessor.nitro.ts) |
| JS bridge | [`lib/features/Lens/ColorPalette/getColorLensRegion.ts`](../../lib/features/Lens/ColorPalette/getColorLensRegion.ts) |
