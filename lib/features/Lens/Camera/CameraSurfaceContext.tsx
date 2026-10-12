import {
  CAMERA_POSITION,
  CAMERA_VIEW_MODE,
  cameraDeviceOptions,
  flashModeOptions,
  type CameraPosition,
  type CameraViewMode,
} from '@features/Lens/Camera/options';
import { useFocusEffect } from 'expo-router';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { type CameraDevice, type CameraRef, useCameraDevice } from 'react-native-vision-camera';

const flashModeOptionsLength = flashModeOptions.length;

export interface CameraSurfaceContextValue {
  cameraRef: React.RefObject<CameraRef | null>;
  showPreview: boolean;
  isActive: boolean;
  flashMode: number;
  gridMode: number;
  cameraViewMode: CameraViewMode;
  device: CameraDevice | undefined;
  onViewModeToggle: () => void;
  onGridToggle: () => void;
  onFlashToggle: () => void;
  onSwitchCameraToggle: () => void;
  onCameraDeviceToggle: () => void;
}

const CameraSurfaceContext = createContext<CameraSurfaceContextValue | null>(null);

/** @internal Test-only access for supplying mock context values in unit specs. */
export const CameraSurfaceContextForTesting = CameraSurfaceContext;

interface CameraSurfaceProviderProps {
  children: ReactNode;
}

export const CameraSurfaceProvider = ({ children }: CameraSurfaceProviderProps) => {
  const [cameraDevice, setCameraDevice] = useState<number>(0);
  const [cameraPosition, setCameraPosition] = useState<CameraPosition>(CAMERA_POSITION.BACK);
  const [flashMode, setFlashMode] = useState<number>(0);
  const [gridMode, setGridMode] = useState<number>(0);
  const [cameraViewMode, setCameraViewMode] = useState<CameraViewMode>(CAMERA_VIEW_MODE.LENS);
  const [isActive, setIsActive] = useState(true);

  const device = useCameraDevice(cameraPosition, {
    physicalDevices: cameraDeviceOptions[cameraDevice].value,
  });

  const cameraRef = useRef<CameraRef>(null);

  // Permissions are hard-gated in Lens.tsx before Camera mounts.
  const showPreview = Boolean(device);

  const handleViewModeToggle = useCallback(() => {
    setCameraViewMode(prev =>
      prev === CAMERA_VIEW_MODE.LENS ? CAMERA_VIEW_MODE.OBSKURA : CAMERA_VIEW_MODE.LENS
    );
  }, []);

  const handleFlashToggle = useCallback(() => {
    setFlashMode(prev => (prev + 1) % flashModeOptionsLength);
  }, []);

  const handleGridToggle = useCallback(() => {
    setGridMode(prev => (prev + 1) % flashModeOptions.length);
  }, []);

  const handleSwitchCameraToggle = useCallback(() => {
    setCameraPosition(prev =>
      prev === CAMERA_POSITION.BACK ? CAMERA_POSITION.FRONT : CAMERA_POSITION.BACK
    );
  }, []);

  const handleCameraDeviceToggle = useCallback(() => {
    setCameraDevice(prev => (prev + 1) % cameraDeviceOptions.length);
  }, []);

  useFocusEffect(
    useCallback(() => {
      setIsActive(true);

      return () => {
        setIsActive(false);
      };
    }, [])
  );

  const value = useMemo(
    () => ({
      cameraRef,
      showPreview,
      isActive,
      flashMode,
      gridMode,
      cameraViewMode,
      device,
      onViewModeToggle: handleViewModeToggle,
      onGridToggle: handleGridToggle,
      onFlashToggle: handleFlashToggle,
      onSwitchCameraToggle: handleSwitchCameraToggle,
      onCameraDeviceToggle: handleCameraDeviceToggle,
    }),
    [
      showPreview,
      isActive,
      flashMode,
      gridMode,
      cameraViewMode,
      device,
      handleViewModeToggle,
      handleGridToggle,
      handleFlashToggle,
      handleSwitchCameraToggle,
      handleCameraDeviceToggle,
    ]
  );

  return <CameraSurfaceContext.Provider value={value}>{children}</CameraSurfaceContext.Provider>;
};

export const useCameraSurface = (): CameraSurfaceContextValue => {
  const context = useContext(CameraSurfaceContext);

  if (context === null) {
    throw new Error('useCameraSurface must be used within a CameraSurfaceProvider');
  }

  return context;
};
