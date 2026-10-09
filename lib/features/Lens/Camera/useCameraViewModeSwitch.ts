import {
  CAMERA_VIEW_MODE,
  type CameraViewMode,
} from '@features/Lens/Camera/options';
import { useCallback, useEffect, useRef, useState } from 'react';

const oppositeViewMode = (mode: CameraViewMode): CameraViewMode =>
  mode === CAMERA_VIEW_MODE.LENS ? CAMERA_VIEW_MODE.OBSKURA : CAMERA_VIEW_MODE.LENS;

export const useCameraViewModeSwitch = () => {
  const [cameraViewMode, setCameraViewMode] = useState<CameraViewMode>(CAMERA_VIEW_MODE.LENS);
  const [isCameraActive, setIsCameraActive] = useState(true);
  const [pendingViewMode, setPendingViewMode] = useState<CameraViewMode | null>(null);

  const isScreenFocusedRef = useRef(true);
  const cameraViewModeRef = useRef(cameraViewMode);
  const pendingViewModeRef = useRef(pendingViewMode);

  const onViewModeToggle = useCallback(() => {
    const next = oppositeViewMode(pendingViewModeRef.current ?? cameraViewModeRef.current);
    pendingViewModeRef.current = next;
    // Deactivate in the event handler so the next commit is inactive before remount.
    setPendingViewMode(next);
    setIsCameraActive(false);
  }, []);

  useEffect(() => {
    if (pendingViewMode === null) {
      return;
    }

    /* AVCapture: remount / resume only after the inactive commit from onViewModeToggle. */
    /* eslint-disable react-hooks/set-state-in-effect -- intentional post-deactivate swap/resume */
    if (cameraViewMode !== pendingViewMode) {
      cameraViewModeRef.current = pendingViewMode;
      setCameraViewMode(pendingViewMode);
      return;
    }

    pendingViewModeRef.current = null;
    setPendingViewMode(null);
    if (isScreenFocusedRef.current) {
      setIsCameraActive(true);
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [pendingViewMode, cameraViewMode]);

  const onScreenFocus = useCallback(() => {
    isScreenFocusedRef.current = true;
    if (pendingViewModeRef.current === null) {
      setIsCameraActive(true);
    }
  }, []);

  const onScreenBlur = useCallback(() => {
    isScreenFocusedRef.current = false;
    pendingViewModeRef.current = null;
    setPendingViewMode(null);
    setIsCameraActive(false);
  }, []);

  return {
    cameraViewMode,
    isCameraActive,
    onViewModeToggle,
    onScreenFocus,
    onScreenBlur,
  };
};
