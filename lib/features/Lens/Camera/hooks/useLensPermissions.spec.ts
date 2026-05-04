import { renderHook, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';

import { useLensPermissions } from './useLensPermissions';

const mockRequestCamera = jest.fn(() => Promise.resolve());
const mockRequestMic = jest.fn(() => Promise.resolve());
const mockRequestMedia = jest.fn(() => Promise.resolve());

let mockCameraHasPermission = false;
let mockMicHasPermission = false;
let mockMediaGranted = false;

jest.mock('react-native-vision-camera', () => ({
  useCameraPermission: () => ({
    hasPermission: mockCameraHasPermission,
    requestPermission: mockRequestCamera,
  }),
  useMicrophonePermission: () => ({
    hasPermission: mockMicHasPermission,
    requestPermission: mockRequestMic,
  }),
}));

jest.mock('expo-media-library', () => ({
  usePermissions: () => [
    { granted: mockMediaGranted, status: mockMediaGranted ? 'granted' : 'undetermined' },
    mockRequestMedia,
  ],
}));

describe('useLensPermissions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCameraHasPermission = false;
    mockMicHasPermission = false;
    mockMediaGranted = false;
  });

  it('returns permission flags from hooks', () => {
    mockCameraHasPermission = true;
    mockMicHasPermission = true;
    mockMediaGranted = true;

    const { result } = renderHook(() => useLensPermissions());

    expect(result.current.cameraPermission).toBe(true);
    expect(result.current.microphonePermission).toBe(true);
    expect(result.current.mediaLibraryPermission).toBe(true);
  });

  it('requests missing permissions on mount', async () => {
    const { result } = renderHook(() => useLensPermissions());

    await waitFor(() => {
      expect(mockRequestCamera).toHaveBeenCalled();
      expect(mockRequestMic).toHaveBeenCalled();
      expect(mockRequestMedia).toHaveBeenCalled();
    });

    expect(result.current.requestCameraPermission).toBe(mockRequestCamera);
    expect(result.current.requestMicrophonePermission).toBe(mockRequestMic);
    expect(result.current.requestMediaLibraryPermission).toBe(mockRequestMedia);
  });

  it('alerts when permission request throws', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    mockRequestCamera.mockRejectedValueOnce(new Error('denied'));

    renderHook(() => useLensPermissions());

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        'Permissions Required',
        'Camera and microphone and media library permissions are required to use this feature.',
        [{ text: 'OK' }]
      );
    });

    alertSpy.mockRestore();
    mockRequestCamera.mockImplementation(() => Promise.resolve());
  });
});
