import { CAMERA_VIEW_MODE } from '@features/Lens/Camera/options';
import { act, renderHook } from '@testing-library/react-native';

import { useCameraViewModeSwitch } from './useCameraViewModeSwitch';

describe('useCameraViewModeSwitch', () => {
  describe('initial state', () => {
    it('starts on LENS with the camera active', () => {
      const { result } = renderHook(() => useCameraViewModeSwitch());

      expect(result.current.cameraViewMode).toBe(CAMERA_VIEW_MODE.LENS);
      expect(result.current.isCameraActive).toBe(true);
    });
  });

  describe('happy path', () => {
    it('switches LENS to OBSKURA and reactivates when focused', () => {
      const { result } = renderHook(() => useCameraViewModeSwitch());

      act(() => {
        result.current.onViewModeToggle();
      });

      expect(result.current.cameraViewMode).toBe(CAMERA_VIEW_MODE.OBSKURA);
      expect(result.current.isCameraActive).toBe(true);
    });

    it('switches OBSKURA back to LENS', () => {
      const { result } = renderHook(() => useCameraViewModeSwitch());

      act(() => {
        result.current.onViewModeToggle();
      });
      act(() => {
        result.current.onViewModeToggle();
      });

      expect(result.current.cameraViewMode).toBe(CAMERA_VIEW_MODE.LENS);
      expect(result.current.isCameraActive).toBe(true);
    });
  });

  describe('pending / rapid taps', () => {
    it('double toggle before swap settles returns to LENS', () => {
      const { result } = renderHook(() => useCameraViewModeSwitch());

      act(() => {
        result.current.onViewModeToggle();
        result.current.onViewModeToggle();
      });

      expect(result.current.cameraViewMode).toBe(CAMERA_VIEW_MODE.LENS);
      expect(result.current.isCameraActive).toBe(true);
    });

    it('triple toggle ends on OBSKURA', () => {
      const { result } = renderHook(() => useCameraViewModeSwitch());

      act(() => {
        result.current.onViewModeToggle();
        result.current.onViewModeToggle();
        result.current.onViewModeToggle();
      });

      expect(result.current.cameraViewMode).toBe(CAMERA_VIEW_MODE.OBSKURA);
      expect(result.current.isCameraActive).toBe(true);
    });

    it('updates pending again when already inactive with a pending switch', () => {
      const { result } = renderHook(() => useCameraViewModeSwitch());

      act(() => {
        result.current.onScreenBlur();
      });
      act(() => {
        result.current.onViewModeToggle();
        result.current.onViewModeToggle();
      });

      expect(result.current.cameraViewMode).toBe(CAMERA_VIEW_MODE.LENS);
      expect(result.current.isCameraActive).toBe(false);
    });

    it('queues pending while blurred idle and stays inactive until focus', () => {
      const { result } = renderHook(() => useCameraViewModeSwitch());

      act(() => {
        result.current.onScreenBlur();
      });
      act(() => {
        result.current.onViewModeToggle();
      });

      expect(result.current.cameraViewMode).toBe(CAMERA_VIEW_MODE.OBSKURA);
      expect(result.current.isCameraActive).toBe(false);

      act(() => {
        result.current.onScreenFocus();
      });

      expect(result.current.cameraViewMode).toBe(CAMERA_VIEW_MODE.OBSKURA);
      expect(result.current.isCameraActive).toBe(true);
    });
  });

  describe('focus and blur', () => {
    it('deactivates on blur while idle and clears any pending intent', () => {
      const { result } = renderHook(() => useCameraViewModeSwitch());

      act(() => {
        result.current.onScreenBlur();
      });

      expect(result.current.isCameraActive).toBe(false);
      expect(result.current.cameraViewMode).toBe(CAMERA_VIEW_MODE.LENS);
    });

    it('clears pending mid-switch on blur and never auto-reactivates', () => {
      const { result } = renderHook(() => useCameraViewModeSwitch());

      act(() => {
        result.current.onViewModeToggle();
        result.current.onScreenBlur();
      });

      expect(result.current.isCameraActive).toBe(false);
    });

    it('reactivates on focus when idle and inactive', () => {
      const { result } = renderHook(() => useCameraViewModeSwitch());

      act(() => {
        result.current.onScreenBlur();
      });
      act(() => {
        result.current.onScreenFocus();
      });

      expect(result.current.isCameraActive).toBe(true);
      expect(result.current.cameraViewMode).toBe(CAMERA_VIEW_MODE.LENS);
    });

    it('is idempotent when focusing while already active', () => {
      const { result } = renderHook(() => useCameraViewModeSwitch());

      act(() => {
        result.current.onScreenFocus();
      });

      expect(result.current.isCameraActive).toBe(true);
      expect(result.current.cameraViewMode).toBe(CAMERA_VIEW_MODE.LENS);
    });

    it('does not force active on focus while a pending switch is in flight', () => {
      const { result } = renderHook(() => useCameraViewModeSwitch());

      act(() => {
        result.current.onScreenBlur();
      });

      act(() => {
        result.current.onViewModeToggle();
        result.current.onScreenFocus();
      });

      expect(result.current.cameraViewMode).toBe(CAMERA_VIEW_MODE.OBSKURA);
      expect(result.current.isCameraActive).toBe(true);
    });

    it('focus after blur-cleared pending reactivates without remounting to a new mode', () => {
      const { result } = renderHook(() => useCameraViewModeSwitch());

      act(() => {
        result.current.onViewModeToggle();
      });
      expect(result.current.cameraViewMode).toBe(CAMERA_VIEW_MODE.OBSKURA);

      act(() => {
        result.current.onViewModeToggle();
        result.current.onScreenBlur();
      });

      expect(result.current.isCameraActive).toBe(false);

      act(() => {
        result.current.onScreenFocus();
      });

      expect(result.current.isCameraActive).toBe(true);
      expect(result.current.cameraViewMode).toBe(CAMERA_VIEW_MODE.OBSKURA);
    });

    it('swap while unfocused clears pending and stays inactive', () => {
      const { result } = renderHook(() => useCameraViewModeSwitch());

      act(() => {
        result.current.onScreenBlur();
      });
      act(() => {
        result.current.onViewModeToggle();
      });

      expect(result.current.cameraViewMode).toBe(CAMERA_VIEW_MODE.OBSKURA);
      expect(result.current.isCameraActive).toBe(false);

      act(() => {
        result.current.onViewModeToggle();
      });

      expect(result.current.cameraViewMode).toBe(CAMERA_VIEW_MODE.LENS);
      expect(result.current.isCameraActive).toBe(false);
    });
  });

  describe('stability', () => {
    it('keeps toggle and focus handlers referentially stable across idle re-renders', () => {
      const { result } = renderHook(() => useCameraViewModeSwitch());

      const toggle = result.current.onViewModeToggle;
      const focus = result.current.onScreenFocus;
      const blur = result.current.onScreenBlur;

      act(() => {
        result.current.onScreenFocus();
      });

      expect(result.current.onViewModeToggle).toBe(toggle);
      expect(result.current.onScreenFocus).toBe(focus);
      expect(result.current.onScreenBlur).toBe(blur);
    });

    it('does not throw when unmounted mid-switch', () => {
      const { result, unmount } = renderHook(() => useCameraViewModeSwitch());

      expect(() => {
        act(() => {
          result.current.onViewModeToggle();
          unmount();
        });
      }).not.toThrow();
    });
  });
});
