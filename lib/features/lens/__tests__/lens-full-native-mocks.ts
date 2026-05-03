/* Shared Jest native doubles for lens camera + lens screen specs.
 * Import this file before any imports from @features/lens (side effect only). */

jest.mock('@features/lens/camera/createSkiaLensPaint', () => ({
  createSkiaLensPaint: jest.fn(() => ({ dispose: jest.fn() })),
}));

jest.mock('@features/lens/camera/applySkiaLensToPhotoFile', () => ({
  applySkiaLensToPhotoFile: jest.fn(async () => 'file:///cache/lens-skia-filtered.jpg'),
}));

jest.mock('react-native-worklets-core', () => ({
  Worklets: {
    createRunOnJS: <T extends (...args: unknown[]) => unknown>(fn: T) =>
      ((...args: unknown[]) => (fn as (...a: unknown[]) => unknown)(...args)) as unknown as T,
  },
}));

jest.mock('react-native-gesture-handler', () => {
  const React = require('react');
  const { View } = require('react-native');
  const RNGH = jest.requireActual('react-native-gesture-handler');
  const { lensGestureMockState } = require('./lens-gesture-mock-state');
  return {
    ...RNGH,
    Gesture: {
      Tap: () => ({
        onEnd: (cb: (e: { x: number; y: number }) => void) => {
          lensGestureMockState.tapOnEnd = cb;
          return { gestureId: 'tap-mock' };
        },
      }),
    },
    GestureDetector: ({ children }: { children: React.ReactNode }) =>
      React.createElement(View, { testID: 'gesture-detector-mock' }, children),
  };
});

jest.mock('react-native-vision-camera', () => {
  const React = require('react');
  const { View } = require('react-native');
  const { lensVisionCameraMockState } = require('./lens-vision-camera-mock-state');

  const MockCamera = React.forwardRef((props: Record<string, unknown>, ref: React.Ref<unknown>) => {
    React.useImperativeHandle(ref, () => ({
      takePhoto: (...args: unknown[]) => lensVisionCameraMockState.takePhoto(...args),
      startRecording: (...args: unknown[]) => lensVisionCameraMockState.startRecording(...args),
      stopRecording: (...args: unknown[]) => lensVisionCameraMockState.stopRecording(...args),
      focus: (...args: unknown[]) => lensVisionCameraMockState.focus(...args),
    }));
    return React.createElement(View, { testID: 'vision-camera-mock', style: props.style });
  });
  MockCamera.displayName = 'MockVisionCamera';

  return {
    Camera: MockCamera,
    useCameraDevice: (...args: unknown[]) => lensVisionCameraMockState.useCameraDevice(...args),
    useCameraPermission: () => lensVisionCameraMockState.useCameraPermission(),
    useMicrophonePermission: () => lensVisionCameraMockState.useMicrophonePermission(),
    useFrameProcessor: (fn: (f: unknown) => void, deps: unknown) =>
      lensVisionCameraMockState.useFrameProcessor(fn, deps),
    useSkiaFrameProcessor: (fn: (f: unknown) => void, deps: unknown) =>
      lensVisionCameraMockState.useSkiaFrameProcessor(fn, deps),
    VisionCameraProxy: {
      initFrameProcessorPlugin: () => lensVisionCameraMockState.initFrameProcessorPlugin(),
    },
  };
});

jest.mock('expo-media-library', () => {
  const actual = jest.requireActual('expo-media-library');
  const { lensMediaLibraryMockState } = require('./lens-media-library-mock-state');
  return {
    ...actual,
    getAssetsAsync: (...args: unknown[]) => lensMediaLibraryMockState.getAssetsAsync(...args),
    createAssetAsync: (...args: unknown[]) => lensMediaLibraryMockState.createAssetAsync(...args),
    usePermissions: () =>
      [
        {
          granted: lensMediaLibraryMockState.mediaLibraryGranted,
          status: lensMediaLibraryMockState.mediaLibraryGranted ? 'granted' : 'denied',
        },
        lensMediaLibraryMockState.requestMediaLibraryPermission,
      ] as const,
  };
});

jest.mock('@storage/storage', () => {
  const actual = jest.requireActual('@storage/storage');
  const { lensStorageMockState } = require('./lens-storage-mock-state');
  return {
    ...actual,
    loadData: (key: string) => lensStorageMockState.loadData(key),
    saveData: (key: string, value: unknown) => lensStorageMockState.saveData(key, value),
  };
});

jest.mock('expo-router', () => {
  const actual = jest.requireActual('expo-router');
  const React = require('react');
  return {
    ...actual,
    useFocusEffect: (cb: () => void | (() => void)) => {
      React.useLayoutEffect(() => {
        const cleanup = cb();
        return () => {
          if (typeof cleanup === 'function') {
            cleanup();
          }
        };
      }, []);
    },
  };
});

jest.mock('@react-navigation/bottom-tabs', () => ({
  ...jest.requireActual('@react-navigation/bottom-tabs'),
  useBottomTabBarHeight: jest.fn(() => 0),
}));

jest.mock('react-native-safe-area-context', () => {
  const actual = jest.requireActual('react-native-safe-area-context');
  return {
    ...actual,
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  };
});

export {};
