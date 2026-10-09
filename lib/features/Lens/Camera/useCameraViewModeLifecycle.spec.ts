import { CAMERA_VIEW_MODE } from '@features/Lens/Camera/options';
import { act, renderHook } from '@testing-library/react-native';

import { useCameraViewModeLifecycle } from './useCameraViewModeLifecycle';

describe('useCameraViewModeLifecycle', () => {
  describe('initial state', () => {
    it('starts on Lens, active, and idle', () => {
      const { result } = renderHook(() => useCameraViewModeLifecycle());

      expect(result.current.cameraViewMode).toBe(CAMERA_VIEW_MODE.LENS);
      expect(result.current.isCameraActive).toBe(true);
      expect(result.current.isViewModeSwitching).toBe(false);
    });
  });

  describe('toggle → stop → swap → start → idle', () => {
    it('keeps mounted mode until onSessionStopped, then starts and idles on onSessionStarted', () => {
      const { result } = renderHook(() => useCameraViewModeLifecycle());

      act(() => {
        result.current.onViewModeToggle();
      });

      expect(result.current.cameraViewMode).toBe(CAMERA_VIEW_MODE.LENS);
      expect(result.current.isCameraActive).toBe(false);
      expect(result.current.isViewModeSwitching).toBe(true);

      act(() => {
        result.current.onSessionStopped();
      });

      expect(result.current.cameraViewMode).toBe(CAMERA_VIEW_MODE.OBSKURA);
      expect(result.current.isCameraActive).toBe(true);
      expect(result.current.isViewModeSwitching).toBe(true);

      act(() => {
        result.current.onSessionStarted();
      });

      expect(result.current.cameraViewMode).toBe(CAMERA_VIEW_MODE.OBSKURA);
      expect(result.current.isCameraActive).toBe(true);
      expect(result.current.isViewModeSwitching).toBe(false);
    });

    it('round-trips Obskura back to Lens through the same lifecycle', () => {
      const { result } = renderHook(() => useCameraViewModeLifecycle());

      act(() => {
        result.current.onViewModeToggle();
      });
      act(() => {
        result.current.onSessionStopped();
      });
      act(() => {
        result.current.onSessionStarted();
      });

      expect(result.current.cameraViewMode).toBe(CAMERA_VIEW_MODE.OBSKURA);

      act(() => {
        result.current.onViewModeToggle();
      });
      expect(result.current.cameraViewMode).toBe(CAMERA_VIEW_MODE.OBSKURA);
      expect(result.current.isCameraActive).toBe(false);

      act(() => {
        result.current.onSessionStopped();
      });
      expect(result.current.cameraViewMode).toBe(CAMERA_VIEW_MODE.LENS);

      act(() => {
        result.current.onSessionStarted();
      });
      expect(result.current.cameraViewMode).toBe(CAMERA_VIEW_MODE.LENS);
      expect(result.current.isViewModeSwitching).toBe(false);
    });
  });

  describe('rapid toggles', () => {
    it('double-toggle while stopping cancels swap via already-inactive completion', () => {
      const { result } = renderHook(() => useCameraViewModeLifecycle());

      act(() => {
        result.current.onViewModeToggle();
        result.current.onViewModeToggle();
      });

      // Second toggle sees inactive session and completes cancel without waiting for onStopped.
      expect(result.current.cameraViewMode).toBe(CAMERA_VIEW_MODE.LENS);
      expect(result.current.isCameraActive).toBe(true);
      expect(result.current.isViewModeSwitching).toBe(false);
    });

    it('triple-toggle before stopped mounts Obskura on stopped', () => {
      const { result } = renderHook(() => useCameraViewModeLifecycle());

      act(() => {
        result.current.onViewModeToggle();
        result.current.onViewModeToggle();
        result.current.onViewModeToggle();
      });

      act(() => {
        result.current.onSessionStopped();
      });

      expect(result.current.cameraViewMode).toBe(CAMERA_VIEW_MODE.OBSKURA);
      expect(result.current.isCameraActive).toBe(true);
      expect(result.current.isViewModeSwitching).toBe(true);

      act(() => {
        result.current.onSessionStarted();
      });

      expect(result.current.isViewModeSwitching).toBe(false);
    });

    it('toggle during starting updates desired and waits for next stop cycle', () => {
      const { result } = renderHook(() => useCameraViewModeLifecycle());

      act(() => {
        result.current.onViewModeToggle();
      });
      act(() => {
        result.current.onSessionStopped();
      });

      expect(result.current.cameraViewMode).toBe(CAMERA_VIEW_MODE.OBSKURA);
      expect(result.current.isViewModeSwitching).toBe(true);

      act(() => {
        result.current.onViewModeToggle();
      });

      expect(result.current.cameraViewMode).toBe(CAMERA_VIEW_MODE.OBSKURA);
      expect(result.current.isCameraActive).toBe(false);

      act(() => {
        result.current.onSessionStopped();
      });

      expect(result.current.cameraViewMode).toBe(CAMERA_VIEW_MODE.LENS);

      act(() => {
        result.current.onSessionStarted();
      });

      expect(result.current.cameraViewMode).toBe(CAMERA_VIEW_MODE.LENS);
      expect(result.current.isViewModeSwitching).toBe(false);
    });
  });

  describe('session callbacks ignored when idle', () => {
    it('ignores onSessionStopped when phase is idle', () => {
      const { result } = renderHook(() => useCameraViewModeLifecycle());

      act(() => {
        result.current.onSessionStopped();
      });

      expect(result.current.cameraViewMode).toBe(CAMERA_VIEW_MODE.LENS);
      expect(result.current.isCameraActive).toBe(true);
      expect(result.current.isViewModeSwitching).toBe(false);
    });

    it('ignores onSessionStarted when phase is idle', () => {
      const { result } = renderHook(() => useCameraViewModeLifecycle());

      act(() => {
        result.current.onSessionStarted();
      });

      expect(result.current.cameraViewMode).toBe(CAMERA_VIEW_MODE.LENS);
      expect(result.current.isViewModeSwitching).toBe(false);
    });

    it('ignores onSessionStarted while still stopping', () => {
      const { result } = renderHook(() => useCameraViewModeLifecycle());

      act(() => {
        result.current.onViewModeToggle();
      });
      act(() => {
        result.current.onSessionStarted();
      });

      expect(result.current.cameraViewMode).toBe(CAMERA_VIEW_MODE.LENS);
      expect(result.current.isCameraActive).toBe(false);
      expect(result.current.isViewModeSwitching).toBe(true);
    });
  });

  describe('focus and blur', () => {
    it('deactivates on blur and reactivates on focus when idle', () => {
      const { result } = renderHook(() => useCameraViewModeLifecycle());

      act(() => {
        result.current.onScreenBlur();
      });
      expect(result.current.isCameraActive).toBe(false);

      act(() => {
        result.current.onScreenFocus();
      });
      expect(result.current.isCameraActive).toBe(true);
    });

    it('blur during stopping cancels desired swap and stays inactive after stopped', () => {
      const { result } = renderHook(() => useCameraViewModeLifecycle());

      act(() => {
        result.current.onViewModeToggle();
      });
      act(() => {
        result.current.onScreenBlur();
      });

      expect(result.current.cameraViewMode).toBe(CAMERA_VIEW_MODE.LENS);
      expect(result.current.isCameraActive).toBe(false);

      act(() => {
        result.current.onSessionStopped();
      });

      expect(result.current.cameraViewMode).toBe(CAMERA_VIEW_MODE.LENS);
      expect(result.current.isCameraActive).toBe(false);
      expect(result.current.isViewModeSwitching).toBe(false);
    });

    it('blur during starting cancels further swap and waits for stop before idle inactive', () => {
      const { result } = renderHook(() => useCameraViewModeLifecycle());

      act(() => {
        result.current.onViewModeToggle();
      });
      act(() => {
        result.current.onSessionStopped();
      });

      expect(result.current.cameraViewMode).toBe(CAMERA_VIEW_MODE.OBSKURA);
      expect(result.current.isCameraActive).toBe(true);

      act(() => {
        result.current.onScreenBlur();
      });

      expect(result.current.isCameraActive).toBe(false);
      expect(result.current.isViewModeSwitching).toBe(true);

      act(() => {
        result.current.onSessionStopped();
      });

      expect(result.current.cameraViewMode).toBe(CAMERA_VIEW_MODE.OBSKURA);
      expect(result.current.isCameraActive).toBe(false);
      expect(result.current.isViewModeSwitching).toBe(false);
    });

    it('does not reactivate on focus while stopping', () => {
      const { result } = renderHook(() => useCameraViewModeLifecycle());

      act(() => {
        result.current.onViewModeToggle();
      });
      act(() => {
        result.current.onScreenFocus();
      });

      expect(result.current.isCameraActive).toBe(false);
      expect(result.current.isViewModeSwitching).toBe(true);
    });

    it('advances swap immediately when toggling while already inactive', () => {
      const { result } = renderHook(() => useCameraViewModeLifecycle());

      act(() => {
        result.current.onScreenBlur();
      });

      act(() => {
        result.current.onViewModeToggle();
      });

      expect(result.current.cameraViewMode).toBe(CAMERA_VIEW_MODE.OBSKURA);
      expect(result.current.isCameraActive).toBe(false);
      expect(result.current.isViewModeSwitching).toBe(true);

      act(() => {
        result.current.onSessionStarted();
      });

      expect(result.current.isViewModeSwitching).toBe(false);
      expect(result.current.isCameraActive).toBe(false);
    });

    it('focus after cancelled stop reactivates when idle', () => {
      const { result } = renderHook(() => useCameraViewModeLifecycle());

      act(() => {
        result.current.onViewModeToggle();
      });
      act(() => {
        result.current.onScreenBlur();
      });
      act(() => {
        result.current.onSessionStopped();
      });
      act(() => {
        result.current.onScreenFocus();
      });

      expect(result.current.cameraViewMode).toBe(CAMERA_VIEW_MODE.LENS);
      expect(result.current.isCameraActive).toBe(true);
      expect(result.current.isViewModeSwitching).toBe(false);
    });
  });

  describe('callback identity', () => {
    it('keeps callback identities stable across renders', () => {
      const { result, rerender } = renderHook(() => useCameraViewModeLifecycle());

      const {
        onViewModeToggle,
        onSessionStarted,
        onSessionStopped,
        onScreenFocus,
        onScreenBlur,
      } = result.current;

      rerender({});

      expect(result.current.onViewModeToggle).toBe(onViewModeToggle);
      expect(result.current.onSessionStarted).toBe(onSessionStarted);
      expect(result.current.onSessionStopped).toBe(onSessionStopped);
      expect(result.current.onScreenFocus).toBe(onScreenFocus);
      expect(result.current.onScreenBlur).toBe(onScreenBlur);
    });
  });
});
