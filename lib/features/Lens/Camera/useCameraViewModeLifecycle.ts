import {
  CAMERA_VIEW_MODE,
  type CameraViewMode,
} from '@features/Lens/Camera/options';
import { useCallback, useRef, useState } from 'react';

type ViewModePhase = 'idle' | 'stopping' | 'starting';

const oppositeViewMode = (mode: CameraViewMode): CameraViewMode =>
  mode === CAMERA_VIEW_MODE.LENS ? CAMERA_VIEW_MODE.OBSKURA : CAMERA_VIEW_MODE.LENS;

export const useCameraViewModeLifecycle = () => {
  const [mountedMode, setMountedMode] = useState<CameraViewMode>(CAMERA_VIEW_MODE.LENS);
  const [, setDesiredMode] = useState<CameraViewMode>(CAMERA_VIEW_MODE.LENS);
  const [phase, setPhase] = useState<ViewModePhase>('idle');
  const [isCameraActive, setIsCameraActive] = useState(true);

  const isScreenFocusedRef = useRef(true);
  const mountedModeRef = useRef(mountedMode);
  const desiredModeRef = useRef<CameraViewMode>(CAMERA_VIEW_MODE.LENS);
  const phaseRef = useRef(phase);
  const isCameraActiveRef = useRef(isCameraActive);

  const completeStopTransition = useCallback(() => {
    if (phaseRef.current !== 'stopping') {
      return;
    }

    const desired = desiredModeRef.current;
    const mounted = mountedModeRef.current;

    if (desired === mounted) {
      phaseRef.current = 'idle';
      setPhase('idle');
      if (isScreenFocusedRef.current) {
        isCameraActiveRef.current = true;
        setIsCameraActive(true);
      }
      return;
    }

    mountedModeRef.current = desired;
    setMountedMode(desired);
    phaseRef.current = 'starting';
    setPhase('starting');
    if (isScreenFocusedRef.current) {
      isCameraActiveRef.current = true;
      setIsCameraActive(true);
    }
  }, []);

  const onViewModeToggle = useCallback(() => {
    const next = oppositeViewMode(desiredModeRef.current);
    desiredModeRef.current = next;
    setDesiredMode(next);

    const wasActive = isCameraActiveRef.current;
    phaseRef.current = 'stopping';
    setPhase('stopping');
    isCameraActiveRef.current = false;
    setIsCameraActive(false);

    // Already inactive: session should already be stopped; advance without waiting.
    if (!wasActive) {
      completeStopTransition();
    }
  }, [completeStopTransition]);

  const onSessionStopped = useCallback(() => {
    completeStopTransition();
  }, [completeStopTransition]);

  const onSessionStarted = useCallback(() => {
    if (phaseRef.current !== 'starting') {
      return;
    }

    phaseRef.current = 'idle';
    setPhase('idle');
  }, []);

  const onScreenFocus = useCallback(() => {
    isScreenFocusedRef.current = true;
    if (phaseRef.current === 'idle') {
      isCameraActiveRef.current = true;
      setIsCameraActive(true);
    }
  }, []);

  const onScreenBlur = useCallback(() => {
    isScreenFocusedRef.current = false;
    isCameraActiveRef.current = false;
    setIsCameraActive(false);

    desiredModeRef.current = mountedModeRef.current;
    setDesiredMode(mountedModeRef.current);

    if (phaseRef.current === 'starting') {
      phaseRef.current = 'stopping';
      setPhase('stopping');
      return;
    }

    if (phaseRef.current === 'stopping') {
      return;
    }

    phaseRef.current = 'idle';
    setPhase('idle');
  }, []);

  return {
    cameraViewMode: mountedMode,
    isCameraActive,
    isViewModeSwitching: phase !== 'idle',
    onViewModeToggle,
    onSessionStarted,
    onSessionStopped,
    onScreenFocus,
    onScreenBlur,
  };
};
