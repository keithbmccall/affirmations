import { useLensPermissions } from '@features/Lens/Camera/hooks/useLensPermissions';
import {
  CAMERA_POSITION,
  CAMERA_VIEW_MODE,
  cameraDeviceOptions,
  flashModeOptions,
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
import {
  CameraPosition,
  useCameraDevice,
  Camera as VisionCamera,
  type CameraDevice,
} from 'react-native-vision-camera';

const flashModeOptionsLength = flashModeOptions.length;

export interface CameraSurfaceContextValue {
  cameraRef: React.RefObject<VisionCamera | null>;
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
  const { cameraPermission, mediaLibraryPermission, microphonePermission } = useLensPermissions();

  const [cameraDevice, setCameraDevice] = useState<number>(0);
  const [cameraPosition, setCameraPosition] = useState<CameraPosition>(CAMERA_POSITION.BACK);
  const [cameraViewMode, setCameraViewMode] = useState<CameraViewMode>(CAMERA_VIEW_MODE.LENS);
  const [flashMode, setFlashMode] = useState<number>(0);
  const [gridMode, setGridMode] = useState<number>(0);
  const [isCameraActive, setIsCameraActive] = useState(true);

  const device = useCameraDevice(cameraPosition, {
    physicalDevices: cameraDeviceOptions[cameraDevice].value,
  });

  const cameraRef = useRef<VisionCamera>(null);

  const hasAllPermissions = cameraPermission && microphonePermission && mediaLibraryPermission;
  const showPreview = Boolean(device && hasAllPermissions);

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

  const handleCameraViewModeToggle = useCallback(() => {
    setCameraViewMode(prev =>
      prev === CAMERA_VIEW_MODE.LENS ? CAMERA_VIEW_MODE.OBSKURA : CAMERA_VIEW_MODE.LENS
    );
  }, []);

  useFocusEffect(
    useCallback(() => {
      setIsCameraActive(true);

      return () => {
        console.log('camera suspended');
        setIsCameraActive(false);
      };
    }, [])
  );

  const value = useMemo(
    () => ({
      cameraRef,
      showPreview,
      isActive: isCameraActive,
      flashMode,
      gridMode,
      cameraViewMode,
      device,
      onViewModeToggle: handleCameraViewModeToggle,
      onGridToggle: handleGridToggle,
      onFlashToggle: handleFlashToggle,
      onSwitchCameraToggle: handleSwitchCameraToggle,
      onCameraDeviceToggle: handleCameraDeviceToggle,
    }),
    [
      showPreview,
      isCameraActive,
      flashMode,
      gridMode,
      cameraViewMode,
      device,
      handleCameraViewModeToggle,
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
