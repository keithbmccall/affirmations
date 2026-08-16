# Vision Camera v4.7 vs v5 — Feature Comparison

Reference for **react-native-vision-camera 4.7.0** (current in this app) versus **v5.x** (upstream). Sources: [v5.0.0 release notes](https://github.com/mrousavy/react-native-vision-camera/releases/tag/v5.0.0), [Margelo v5 blog](https://blog.margelo.com/whats-new-in-visioncamera-v5), [v5 docs](https://visioncamera.margelo.com).

For migration steps in this repo, see [`VISION_CAMERA_V5_MIGRATION.md`](VISION_CAMERA_V5_MIGRATION.md).

---

## At a glance

| Area | v4.7 (today) | v5 |
|------|----------------|-----|
| **Native bridge** | Hand-written JSI/C++ for frame processors | **Nitro Modules** — Swift/Kotlin, type-safe HybridObjects |
| **Device / format config** | `CameraFormat` + `useCameraFormat` + `format` prop | **Constraints API** — intent-based negotiation, no Formats API |
| **Outputs** | Boolean props: `photo`, `video`, `audio` on `<Camera>` | Separate **Output objects** (`usePhotoOutput`, `useVideoOutput`, …) in `outputs={[...]}` |
| **Photo capture** | `cameraRef.takePhoto()` → writes temp **file** to disk | `photoOutput.capturePhoto()` → in-memory **`Photo`** (optional `toImageAsync()`) |
| **Video capture** | `cameraRef.startRecording()` / `stopRecording()` | Methods on **`CameraVideoOutput`** / recorder objects |
| **Frame processors** | `useFrameProcessor`, `useSkiaFrameProcessor` on `<Camera>` | **`useFrameOutput`** (and related outputs); worklets via separate package |
| **Worklets runtime** | `react-native-worklets-core` (this app) | Default: **`react-native-worklets`** via `react-native-vision-camera-worklets` |
| **Native plugins** | `VisionCameraProxy.initFrameProcessorPlugin(...)` | **Nitro Module** plugins with typed HybridObject interfaces |
| **Barcode / QR** | Built-in `CodeScanner` (iOS AVCaptureMetadata, Android MLKit — inconsistent) | **`react-native-vision-camera-barcode-scanner`** (MLKit on both platforms) |
| **Skia preview** | `useSkiaFrameProcessor` in core | Optional **`react-native-vision-camera-skia`** package |
| **Docs site** | react-native-vision-camera.com (v4 era) | **visioncamera.margelo.com** with per-type API reference |

---

## What this app uses on v4.7

These are the v4 APIs in [`lib/features/Lens/`](.) that a v5 migration must replace or re-home:

| v4 API | Where used | Purpose |
|--------|------------|---------|
| `<Camera>` + `device`, `isActive`, `photo`, `fps`, `format` | `LensCameraSurface`, `ObskuraCameraSurface`, `Camera.tsx` | Preview + capture |
| `useCameraFormat(device, filters)` + `Templates.FrameProcessing` | `ObskuraCameraSurface.tsx` | Low-res preview stream + max photo resolution |
| `useFrameProcessor` | `LensCameraSurface.tsx` | Color lens palette extraction |
| `useSkiaFrameProcessor` | `ObskuraCameraSurface.tsx` | Live Obskura GPU filter on preview |
| `VisionCameraProxy.initFrameProcessorPlugin` | `getColorLensPalette.ts`, `colorLensRegionFrameProcessorPlugin.ts` | iOS native color-lens plugins |
| `cameraRef.takePhoto({ flash, enableShutterSound })` | `Camera.tsx` | Still capture |
| `cameraRef.startRecording` / `stopRecording` | `Camera.tsx` | Video (Lens mode, color lens off) |
| `cameraRef.focus({ x, y })` | `useCameraFocus.ts` | Tap-to-focus in view coordinates |
| `Worklets.createRunOnJS` (worklets-core) | `useColorLensPalette.ts`, `useColorLensRegion.ts` | Frame thread → React bridge |
| `Reanimated.createAnimatedComponent(VisionCamera)` | Both camera surfaces | Animated `isActive` / layout |

We do **not** use v4 Code Scanner, depth, RAW, or multi-cam today.

---

## New features in v5

### 1. Nitro Modules foundation

- Core rewritten on [Nitro Modules](https://nitro.margelo.com): ~3,000 fewer lines of hand-written JSI/C++ in frame-processor plumbing.
- `CameraDevice` is a lazy **HybridObject** — properties fetched on access (~15× faster than Turbo Modules per upstream claims).
- Reported benefits: faster cold start, lower camera latency, fewer threading / SIGSEGV-class crashes.

**Lens relevance:** Stability for long Obskura sessions and frame-processor-heavy color lens mode.

### 2. Constraints API (replaces Formats)

v4 pattern (this app’s Obskura surface today):

```tsx
const format = useCameraFormat(device, [
  { fps: 15 },
  ...Templates.FrameProcessing,
  { photoResolution: 'max' },
]);
// <Camera format={format} fps={...} photo />
```

v5 pattern:

```tsx
<Camera
  device="back"
  constraints={[
    { fps: 15 },
    { videoDynamicRange: CommonDynamicRanges.ANY_HDR }, // example
  ]}
  onSessionConfigSelected={(config) => { /* resolved config */ }}
/>
```

- Developer declares **intent** as a prioritized `constraints` array; the camera **negotiates** a supported session config.
- On iOS: filters `AVCaptureDevice.Format`; on Android: probes via `CameraInfo.isSessionConfigSupported(...)`.
- Device capabilities exposed directly on `CameraDevice` (e.g. `supportedFPSRanges`, `getSupportedResolutions(...)`).
- Resolutions depend on which **outputs** are attached — e.g. **8K photos on iOS** when fewer outputs are active (not possible with v4’s format model).

**Lens relevance:** Replaces `useCameraFormat` + `Templates.FrameProcessing` jetsam mitigation strategy; should reduce “format looked valid but session failed” cases on Android.

### 3. Outputs as first-class objects

v5 models five core output types (see [Camera Outputs](https://visioncamera.margelo.com/docs/camera-outputs)):

| Output | Role |
|--------|------|
| `CameraPhotoOutput` | Stills |
| `CameraVideoOutput` | Video + recorder |
| `CameraFrameOutput` | Frame processors / ML |
| `CameraDepthFrameOutput` | Depth / disparity streams |
| `CameraPreviewOutput` | Preview surface |

Capture APIs live on the **output**, not the camera ref.

**Lens relevance:** Photo path, video path, and frame-processor path become explicit outputs attached to one `<Camera outputs={[...]} />`.

### 4. In-memory `Photo` capture

- v4: `takePhoto()` always writes a temp file; apps often read it back immediately.
- v5: `capturePhoto()` returns a **`Photo`** in memory (image + EXIF + metadata).
- Can convert to a displayable image via **`react-native-nitro-image`** without disk round-trip.

**Lens relevance:** Faster shutter-to-preview; our flow still needs a file for `createAssetAsync` / Obskura still export unless we pipe memory → Skia → save.

### 5. Manual AE / AF / AWB (pro controls)

- `setFocusLocked`, `setExposureLocked`, `setWhiteBalanceLocked` on a camera controller.
- **`focusTo(point, options)`** with metering modes, adaptiveness, auto-reset, responsiveness.

**Lens relevance:** Could replace simple `focus({ x, y })` with richer tap-to-focus (e.g. lock focus during Obskura overlay interaction).

### 6. Full dynamic range API

- v4: mostly `videoHdr` boolean tied to format.
- v5: explicit **dynamic range** constraints (SDR, HDR profiles, Apple Log, bit depth, color space).

**Lens relevance:** Optional future Obskura / video HDR modes — not used today.

### 7. Coordinate system conversions

- Convert between **frame**, **camera**, and **preview/view** coordinates.
- Example: draw barcode overlays or region boxes aligned with live preview.

**Lens relevance:** Could simplify color-lens region UI if we draw focus/region rings in view space from frame-processor results.

### 8. Depth data streaming

- **`useDepthOutput`** / `CameraDepthFrameOutput` for LiDAR, ToF, dual-camera disparity.
- Separate from RGB frame processors.

**Lens relevance:** Not used today; potential future “depth-aware” effects.

### 9. RAW capture

- Adobe DNG and Apple ProRAW still capture for pro workflows.

**Lens relevance:** Out of scope for current product.

### 10. Multi-camera sessions

- Imperative **`VisionCamera.createCameraSession(true)`** — front + back (or other combos) simultaneously.
- `supportsMultiCamSessions` guard; `supportedMultiCamDeviceCombinations` for valid pairs.

**Lens relevance:** Not used today.

### 11. `CameraObjectOutput` (iOS)

- Metadata-driven detection: QR, faces, human body, animals via `AVCaptureMetadataOutput`.

**Lens relevance:** Alternative to custom frame processors for simple detection UIs.

### 12. GPU-accelerated resizer (`react-native-vision-camera-resizer`)

- Metal / Vulkan compute for resize, YUV→RGB, crop — ~5× faster than CPU resize plugins (per upstream benchmarks).
- Useful for ML tensor prep (ONNX, TFLite).

**Lens relevance:** Could accelerate color-lens sampling if we move off custom Swift pixel reads.

### 13. Modular package ecosystem

| Package | Purpose |
|---------|---------|
| `react-native-vision-camera` | Core sessions, `<Camera>`, outputs |
| `react-native-vision-camera-worklets` | Frame processor JS runtime (default: `react-native-worklets`) |
| `react-native-vision-camera-skia` | Skia-based preview / effects |
| `react-native-vision-camera-barcode-scanner` | MLKit barcode scanning (both platforms) |
| `react-native-vision-camera-resizer` | GPU frame resize |
| `react-native-vision-camera-location` | GPS EXIF on photos/video |

**Lens relevance:** Obskura may move to **`vision-camera-skia`** package; color lens plugins become Nitro modules; worklets dependency may shift from **worklets-core** to **react-native-worklets**.

### 14. Native frame processor plugins as Nitro modules

- v4: `VisionCameraProxy.initFrameProcessorPlugin('name', options)` + loosely typed maps.
- v5: Typed **HybridObject** interfaces; plugins are standalone Nitro packages.

**Lens relevance:** [`expo-color-lens-frame-processor`](../../../modules/expo-color-lens-frame-processor) must be rewritten as a Nitro plugin, not just recompiled.

### 15. Extensible custom `CameraOutput` (native)

- Public `NativeCameraOutput` protocol — third-party native outputs plug into the same session without forking Vision Camera.

**Lens relevance:** Long-term path for custom HDR or bracketing pipelines.

### 16. Imperative session API

- `VisionCamera.createCameraSession`, `session.configure([...])`, `session.start()` for headless or multi-cam control without declarative `<Camera>`.

**Lens relevance:** Not needed for current tab UI; useful for background capture experiments.

### 17. New documentation site

- [visioncamera.margelo.com](https://visioncamera.margelo.com) — API docs per public type, migration guides, output-specific guides.

---

## Breaking changes (v4.7 → v5)

| v4.7 | v5 |
|------|-----|
| `useCameraFormat(device, filters)` | **Removed** → `constraints={[...]}` on `<Camera>` |
| `format={format}` prop | **Removed** |
| `photo` / `video` / `audio` boolean props | **`outputs={[photoOutput, videoOutput, ...]}`** |
| `cameraRef.takePhoto()` | **`photoOutput.capturePhoto()`** → `Photo` object |
| `cameraRef.startRecording()` | **Video output / recorder API** |
| `useFrameProcessor` / `useSkiaFrameProcessor` on `<Camera>` | **`useFrameOutput`** (+ optional `vision-camera-skia` / `vision-camera-worklets`) |
| Built-in `CodeScanner` | **`react-native-vision-camera-barcode-scanner`** |
| `VisionCameraProxy.initFrameProcessorPlugin` | **Nitro Module** frame processor plugins |
| `react-native-worklets-core` as default | **`react-native-worklets`** via `react-native-vision-camera-worklets` (worklets-core may still work in transition — verify release notes at migration time) |

---

## What v5 does *not* automatically give this app

Upgrading does not by itself:

- Ship **Android color lens** — still requires native plugin work in `expo-color-lens-frame-processor`.
- Remove **Obskura offscreen Skia export** — `applyObskuraLensToPhotoFile.ts` stays unless we adopt in-memory `Photo` + nitro-image/Skia pipeline end-to-end.
- Fix **Expo SDK compatibility** — must wait until Expo bundles/tested Vision Camera 5.x (same pattern as FlashList v2 on SDK 53).

---

## Suggested evaluation order for Lens

1. **Constraints API** — replace Obskura `useCameraFormat` / jetsam tuning.
2. **Outputs model** — split photo, video, frame (color lens), Skia preview (Obskura).
3. **Worklets package** — align `react-native-worklets` vs `worklets-core` with `useColorLensPalette` bridges.
4. **Nitro color-lens plugin** — rebuild `expo-color-lens-frame-processor` for v5.
5. **Optional wins** — in-memory photo preview, `focusTo` options, coordinate helpers for region UI.

---

## Further reading

- [Vision Camera v5.0.0 release](https://github.com/mrousavy/react-native-vision-camera/releases/tag/v5.0.0)
- [What's New in VisionCamera V5 (Margelo)](https://blog.margelo.com/whats-new-in-visioncamera-v5)
- [v5 docs — Getting started](https://visioncamera.margelo.com/docs)
- [v5 docs — Camera Outputs](https://visioncamera.margelo.com/docs/camera-outputs)
- This repo: [`VISION_CAMERA_V5_MIGRATION.md`](VISION_CAMERA_V5_MIGRATION.md)
