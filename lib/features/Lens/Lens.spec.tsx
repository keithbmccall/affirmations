import { fireEvent, render, screen } from '@testing-library/react-native';
import { router } from 'expo-router';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Lens } from './Lens';

const mockUseLensPermissions = jest.fn(() => ({
  cameraPermission: true,
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
  useCameraRollPrefetch: () => mockUseCameraRollPrefetch(),
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
    expect(mockUseCameraRollPrefetch).toHaveBeenCalled();
    expect(screen.queryByTestId('lens-permissions-required')).toBeNull();
  });

  it('shows permissions shell and does not mount Camera when a permission is missing', async () => {
    mockUseLensPermissions.mockReturnValue({
      cameraPermission: false,
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

  it('navigates back from the permissions shell', async () => {
    mockUseLensPermissions.mockReturnValue({
      cameraPermission: true,
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
