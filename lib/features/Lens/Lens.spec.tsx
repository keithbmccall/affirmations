import { fireEvent, render, screen } from '@testing-library/react-native';
import { router } from 'expo-router';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Lens } from './Lens';

const mockUseLensPermissions = jest.fn(() => ({
  cameraPermission: true,
  hasCameraAccess: true,
  isPermissionsReady: true,
  mediaLibraryPermission: true,
  microphonePermission: true,
  requestCameraPermission: jest.fn(),
  requestMediaLibraryPermission: jest.fn(),
  requestMicrophonePermission: jest.fn(),
}));

jest.mock('@features/Lens/Camera/hooks/useLensPermissions', () => ({
  useLensPermissions: () => mockUseLensPermissions(),
}));

const mockUseCameraRollPrefetch = jest.fn();

jest.mock('@features/Lens/Camera/hooks/useCameraRollPrefetch', () => ({
  useCameraRollPrefetch: (...args: unknown[]) => mockUseCameraRollPrefetch(...args),
}));

jest.mock('@features/Lens/ColorPalette/useInitLensPalettes', () => ({
  useInitLensPalettes: jest.fn(),
}));

jest.mock('@features/Lens/Camera/Camera', () => {
  const RN = jest.requireActual('react-native');
  return {
    Camera: () => <RN.View testID="lens-camera-mock" />,
  };
});

jest.mock('expo-router', () => ({
  router: { back: jest.fn(), push: jest.fn() },
}));

jest.mock('expo-status-bar', () => ({
  StatusBar: () => null,
}));

function TestSafeArea({ children }: { children: React.ReactNode }) {
  return (
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 390, height: 844 },
        insets: { top: 47, left: 0, right: 0, bottom: 34 },
      }}
    >
      {children}
    </SafeAreaProvider>
  );
}

const renderLens = () => render(<Lens />, { wrapper: TestSafeArea });

describe('Lens', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseLensPermissions.mockReturnValue({
      cameraPermission: true,
      hasCameraAccess: true,
      isPermissionsReady: true,
      mediaLibraryPermission: true,
      microphonePermission: true,
      requestCameraPermission: jest.fn(),
      requestMediaLibraryPermission: jest.fn(),
      requestMicrophonePermission: jest.fn(),
    });
  });

  it('mounts Camera and prefetches when all permissions are granted', async () => {
    renderLens();

    expect(await screen.findByTestId('lens-camera-mock')).toBeTruthy();
    expect(mockUseCameraRollPrefetch).toHaveBeenCalledWith(true);
    expect(screen.queryByTestId('lens-permissions-required')).toBeNull();
  });

  it('shows permissions shell and does not mount Camera when camera access is denied', async () => {
    mockUseLensPermissions.mockReturnValue({
      cameraPermission: false,
      hasCameraAccess: false,
      isPermissionsReady: true,
      mediaLibraryPermission: true,
      microphonePermission: true,
      requestCameraPermission: jest.fn(),
      requestMediaLibraryPermission: jest.fn(),
      requestMicrophonePermission: jest.fn(),
    });

    renderLens();

    expect(await screen.findByTestId('lens-permissions-required')).toBeTruthy();
    expect(await screen.findByText('Camera permission required')).toBeTruthy();
    expect(screen.queryByTestId('lens-camera-mock')).toBeNull();
    expect(mockUseCameraRollPrefetch).not.toHaveBeenCalled();
  });

  it('mounts Camera while permissions are still resolving', async () => {
    mockUseLensPermissions.mockReturnValue({
      cameraPermission: true,
      hasCameraAccess: true,
      isPermissionsReady: false,
      mediaLibraryPermission: false,
      microphonePermission: true,
      requestCameraPermission: jest.fn(),
      requestMediaLibraryPermission: jest.fn(),
      requestMicrophonePermission: jest.fn(),
    });

    renderLens();

    expect(await screen.findByTestId('lens-camera-mock')).toBeTruthy();
    expect(screen.queryByTestId('lens-permissions-required')).toBeNull();
  });

  it('shows a blank shell while permissions are resolving and access is not granted yet', async () => {
    mockUseLensPermissions.mockReturnValue({
      cameraPermission: false,
      hasCameraAccess: false,
      isPermissionsReady: false,
      mediaLibraryPermission: false,
      microphonePermission: false,
      requestCameraPermission: jest.fn(),
      requestMediaLibraryPermission: jest.fn(),
      requestMicrophonePermission: jest.fn(),
    });

    renderLens();

    expect(await screen.findByTestId('lens-back-button')).toBeTruthy();
    expect(screen.queryByTestId('lens-permissions-required')).toBeNull();
    expect(screen.queryByTestId('lens-camera-mock')).toBeNull();
  });

  it('navigates back from the permissions shell', async () => {
    mockUseLensPermissions.mockReturnValue({
      cameraPermission: false,
      hasCameraAccess: false,
      isPermissionsReady: true,
      mediaLibraryPermission: false,
      microphonePermission: true,
      requestCameraPermission: jest.fn(),
      requestMediaLibraryPermission: jest.fn(),
      requestMicrophonePermission: jest.fn(),
    });

    renderLens();

    fireEvent.press(await screen.findByTestId('lens-back-button'));

    expect(router.back).toHaveBeenCalled();
  });
});
