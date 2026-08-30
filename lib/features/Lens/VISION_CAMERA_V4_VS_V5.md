# Vision Camera v4.7 vs v5 — Feature Comparison

Reference for **react-native-vision-camera 4.7.0** (current in this app) versus **v5.x** (upstream; latest stable **5.2.x** as of Aug 2026). Sources: [v5.0.0 release notes](https://github.com/mrousavy/react-native-vision-camera/releases/tag/v5.0.0), [Margelo v5 blog](https://blog.margelo.com/whats-new-in-visioncamera-v5), [v5 docs](https://visioncamera.margelo.com).

For migration steps in this repo, see [`VISION_CAMERA_V5_MIGRATION.md`](VISION_CAMERA_V5_MIGRATION.md).

---

## At a glance

| Area | v4.7 (today) | v5 |
|------|----------------|-----|
| **Native bridge** | Hand-written JSI/C++ for frame processors | **Nitro Modules** — Swift/Kotlin HybridObjects |
| **Required deps** | `react-native-worklets-core` (this app) | **`react-native-nitro-modules`**, **`react-native-nitro-image`** (core); frame processors also need **`react-native-vision-camera-worklets`** + **`react-native-worklets`** |
| **Expo config plugin** | Required in `app.json` for managed Expo | **Removed** — must delete plugin entry or startup fails ([issue #3966](https://github.com/mrousavy/react-native-vision-camera/issues/3966)) |
| **Device / format config** | `CameraFormat` + `useCameraFormat` + `format` prop | **Constraints API** — intent-based negotiation |
| **Outputs** | Boolean props: `photo`, `video`, `audio` on `<Camera>` | Separate **Output objects** (`usePhotoOutput`, `useVideoOutput`, `useFrameOutput`, …) in `outputs={[...]}` |
| **Photo capture** | `cameraRef.takePhoto()` → temp **file** on disk | `photoOutput.capturePhoto()` → in-memory **`Photo`** (`toImageAsync()` via nitro-image) |
| **Video capture** | `cameraRef.startRecording()` / `stopRecording()` | **`CameraVideoOutput`** / recorder API |
| **Frame processors** | `useFrameProcessor`, `useSkiaFrameProcessor` on `<Camera>` | **`useFrameOutput`** + **`react-native-vision-camera-worklets`**; Skia via **`react-native-vision-camera-skia`** |
| **Worklets runtime** | `react-native-worklets-core` + Babel plugin | Default: **`react-native-worklets`** via `react-native-vision-camera-worklets` |
| **Native plugins** | `VisionCameraProxy.initFrameProcessorPlugin(...)` + `FrameProcessorPluginRegistry` | **Nitro Module** plugins with typed HybridObject interfaces |
| **Preview ↔ frame coords** | Native `ColorLensImagePipeline` on v4 (this app); hand-rolled JS mappers avoided | **`convertViewPointToCameraPoint`**, **`convertCameraPointToFramePoint`**, etc. |
| **Barcode / QR** | Built-in `CodeScanner` | **`react-native-vision-camera-barcode-scanner`** (MLKit both platforms) |
| **Skia preview** | `useSkiaFrameProcessor` in core | Optional **`react-native-vision-camera-skia`** package |
| **Docs site** | react-native-vision-camera.com (v4 era) | **visioncamera.margelo.com** |

---

## What this app uses on v4.7

These are the v4 APIs in `lib/features/Lens/` that a v5 migration must replace or re-home:

| v4 API | Where used | Purpose |
|--------|------------|---------|
| `<Camera>` + `device`, `isActive`, `photo`, `video`, `audio`, `fps` | `LensCameraSurface`, `ObskuraCameraSurface` | Preview + outputs |
| `useCameraFormat(device, filters)` + `Templates.FrameProcessing` | `ObskuraCameraSurface.tsx` | Low-res preview stream + max photo resolution (jetsam mitigation) |
| `useFrameProcessor` + `runAtTargetFps` | `LensCameraSurface.tsx` | Color lens palette + point-region sampling |
| `useSkiaFrameProcessor` | `ObskuraCameraSurface.tsx` | Live Obskura GPU filter on preview |
| `VisionCameraProxy.initFrameProcessorPlugin` | `getColorLensPalette.ts`, `colorLensRegionFrameProcessorPlugin.ts` | iOS native color-lens plugins |
| `cameraRef.takePhoto({ flash, enableShutterSound })` | **`CameraBottomControls.tsx`** | Still capture |
| `cameraRef.startRecording` / `stopRecording` | **`CameraBottomControls.tsx`** | Video (Lens mode when color lens off) |
| `cameraRef.focus({ x, y })` | `useCameraFocus.ts` (via `Camera.tsx` tap gesture) | Tap-to-focus in view coordinates |
| `Worklets.createRunOnJS` (worklets-core) | `useColorLensPalette.ts`, `useColorLensRegion.ts` | Frame thread → JS bridge |
| `Reanimated.createAnimatedComponent(VisionCamera)` | Both camera surfaces | Animated camera wrapper |
| Fixed-center lens-point sampling | `LensCameraSurface.tsx`, `LensColorRegionIndicator.tsx` | Centered region indicator + native region plugin (movable point deferred) |

We do **not** use v4 Code Scanner, depth, RAW, or multi-cam today.

### Known v4 limitation (lens point mode)

The centered point indicator uses **view-normalized** coordinates (0–1 of the preview overlay). Without preview-aligned sampling, the region plugin crops the **full frame buffer** using those values. Vision Camera preview uses `resizeMode="cover"`, so the visible preview is a cropped subset of the buffer — indicator position and sampled color can diverge.

**Preferred now (v4):** shared native **`ColorLensImagePipeline`** in `expo-color-lens-frame-processor` — cover crop, orientation, and mirror in Swift; JS passes viewport size only. **Later (v5):** optional swap to `convertViewPointToCameraPoint` / `convertCameraPointToFramePoint`. **Movable lens point** (drag off center) is a separate follow-up on the same native foundation.

---

## New features in v5 (Lens-relevant subset)

### 1. Coordinate system conversions

First-class conversion between **preview/view**, **camera**, and **frame** spaces — accounts for `resizeMode`, orientation, mirroring, and cropping.

```ts
// View (drag position) → frame (plugin sampling)
const viewPoint = { x: centerX * viewportWidth, y: centerY * viewportHeight };
const cameraPoint = preview.convertViewPointToCameraPoint(viewPoint);
const framePoint = frame.convertCameraPointToFramePoint(cameraPoint);
// Pass framePoint.x / frame.width, framePoint.y / frame.height to native plugin
```

**Lens relevance:** Fixes lens-point indicator / color-extraction alignment. Also useful for future focus rings or detection overlays.

Docs: [Coordinate Systems](https://visioncamera.margelo.com/docs/coordinate-systems)

### 2. Constraints API (replaces Formats)

v4 pattern (Obskura surface today):

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
  device={device}
  constraints={[
    { fps: 15 },
    // intent-based: video resolution, dynamic range, etc.
  ]}
  onSessionConfigSelected={(config) => { /* resolved config */ }}
  outputs={[photoOutput, frameOutput, ...]}
/>
```

**Lens relevance:** Replaces Obskura `useCameraFormat` / jetsam tuning.

### 3. Outputs as first-class objects

| Output | Role |
|--------|------|
| `CameraPhotoOutput` | Stills |
| `CameraVideoOutput` | Video + recorder |
| `CameraFrameOutput` | Frame processors / ML |
| `CameraDepthFrameOutput` | Depth streams |
| `CameraPreviewOutput` | Preview surface |

Capture APIs live on the **output**, not the camera ref.

### 4. In-memory `Photo` capture

v5 `capturePhoto()` returns a **`Photo`** in memory. Our flow still needs a filesystem path for `createAssetAsync` unless we add a write-to-cache step (`Photo` → file URI).

### 5. Modular packages

| Package | Purpose |
|---------|---------|
| `react-native-vision-camera` | Core sessions, `<Camera>`, outputs |
| `react-native-nitro-modules` / `react-native-nitro-image` | **Required** core peers |
| `react-native-vision-camera-worklets` | Frame processor JS runtime |
| `react-native-worklets` | Default worklets engine (replaces worklets-core as default) |
| `react-native-vision-camera-skia` | Skia-based preview / effects |
| `react-native-vision-camera-barcode-scanner` | MLKit barcode scanning |
| `react-native-vision-camera-resizer` | GPU frame resize/crop (~5× faster than CPU plugins) |
| `react-native-vision-camera-location` | GPS EXIF on photos/video |

### 6. Native frame processor plugins as Nitro modules

v4: `VisionCameraProxy.initFrameProcessorPlugin('name', options)` + loosely typed `[String: Any?]`.

v5: Typed HybridObject interfaces; plugins are standalone Nitro packages.

**Lens relevance:** [`expo-color-lens-frame-processor`](../../../modules/expo-color-lens-frame-processor) must be rewritten — not just recompiled. Current iOS registration uses v4 `FrameProcessorPluginRegistry` in `.m` files.

---

## Breaking changes (v4.7 → v5)

| v4.7 | v5 |
|------|-----|
| Expo config plugin in `app.json` | **Remove plugin block**; keep permission strings in `infoPlist` / Android manifest |
| `useCameraFormat(device, filters)` | **Removed** → `constraints={[...]}` |
| `format={format}` prop | **Removed** |
| `photo` / `video` / `audio` boolean props | **`outputs={[...]}`** |
| `cameraRef.takePhoto()` | **`photoOutput.capturePhoto()`** → `Photo` |
| `cameraRef.startRecording()` | **Video output / recorder API** |
| `useFrameProcessor` / `useSkiaFrameProcessor` on `<Camera>` | **`useFrameOutput`** + worklets/skia packages |
| Built-in `CodeScanner` | **`react-native-vision-camera-barcode-scanner`** |
| `VisionCameraProxy.initFrameProcessorPlugin` | **Nitro Module** frame processor plugins |
| `react-native-worklets-core` as default | **`react-native-worklets`** via `react-native-vision-camera-worklets` |
| `babel.config.js`: `react-native-worklets-core/plugin` | Likely **`react-native-worklets/plugin`** (verify v5 install docs at migration time) |

---

## What v5 does *not* automatically give this app

Upgrading does not by itself:

- Ship **Android color lens** — `expo-color-lens-frame-processor` is **iOS-only** today; Android plugin is still a separate roadmap item.
- Remove **Obskura offscreen Skia export** — `applyObskuraLensToPhotoFile.ts` stays unless we adopt in-memory `Photo` + nitro-image/Skia end-to-end.
- Require an **Expo SDK bump**. This app can stay on **53.0.27 / RN 0.79.6**. Vision Camera 5 peers Expo only as a prebuild host; it does not list a minimum SDK. SDK 54 is optional later and currently riskier on EAS ([issue #3743](https://github.com/mrousavy/react-native-vision-camera/issues/3743)).
- Guarantee **EAS SDK 54** builds — reported **v5 + Nitro + Xcode 26 beta** compile failures. SDK 53 + local Xcode 16.x is the safer first bring-up.
- Fix **lens-point alignment** via native **`ColorLensImagePipeline`** on v4 (or v5 coordinate APIs after upgrade).

---

## Suggested evaluation order for Lens

1. **Stay on Expo 53 / RN 0.79** — no SDK bump required for Vision Camera 5.
2. **Remove v4 Expo plugin + add Nitro deps** — unblocks native compile.
3. **Nitro color-lens plugin** — rebuild `expo-color-lens-frame-processor` for v5 (hard blocker).
4. **Outputs + Constraints API** — replace Obskura `useCameraFormat` and Lens capture booleans.
5. **Worklets package migration** — `react-native-worklets` + update Babel; refactor `Worklets.createRunOnJS` bridges.
6. **Obskura Skia** — move to `react-native-vision-camera-skia` if required by v5.
7. **Coordinate conversion** — wire lens-point view → frame mapping in `LensCameraSurface` frame output handler.
8. **Optional wins** — in-memory photo preview, `focusTo` options, GPU resizer for ML sampling.

---

## Further reading

- [Vision Camera v5.0.0 release](https://github.com/mrousavy/react-native-vision-camera/releases/tag/v5.0.0)
- [What's New in VisionCamera V5 (Margelo)](https://blog.margelo.com/whats-new-in-visioncamera-v5)
- [v5 docs — Getting started](https://visioncamera.margelo.com/docs)
- [v5 docs — Coordinate systems](https://visioncamera.margelo.com/docs/coordinate-systems)
- [v5 docs — Camera Outputs](https://visioncamera.margelo.com/docs/camera-outputs)
- [v5 docs — Native Frame Processor Plugins](https://visioncamera.margelo.com/docs/native-frame-processor-plugins)
- This repo: [`VISION_CAMERA_V5_MIGRATION.md`](VISION_CAMERA_V5_MIGRATION.md)
