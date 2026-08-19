import { renderHook, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { useLensPermissions } from './useLensPermissions';

const mockRequestCamera = jest.fn(() => Promise.resolve(true));
const mockRequestMic = jest.fn(() => Promise.resolve(true));
const mockRequestMedia = jest.fn(() => Promise.resolve({ granted: true }));
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
    mockRequestCamera.mockImplementation(() => Promise.resolve(true));
    mockRequestMic.mockImplementation(() => Promise.resolve(true));
  });

  it('returns permission flags from hooks', () => {
    mockCameraHasPermission = true;
    mockMicHasPermission = true;
    mockMediaGranted = true;

    const { result } = renderHook(() => useLensPermissions());

    expect(result.current.cameraPermission).toBe(true);
    expect(result.current.microphonePermission).toBe(true);
    expect(result.current.mediaLibraryPermission).toBe(true);
    expect(result.current.hasCameraAccess).toBe(true);
  });

  it('marks permissions ready after the initial request cycle', async () => {
    mockCameraHasPermission = true;
    mockMicHasPermission = true;
    mockMediaGranted = true;

    const { result } = renderHook(() => useLensPermissions());

    await waitFor(() => {
      expect(result.current.isPermissionsReady).toBe(true);
    });
  });

  it('requests missing permissions on mount', async () => {
    const { result } = renderHook(() => useLensPermissions());

    await waitFor(() => {
      expect(mockRequestCamera).toHaveBeenCalled();
      expect(mockRequestMic).toHaveBeenCalled();
      expect(mockRequestMedia).toHaveBeenCalled();
      expect(result.current.isPermissionsReady).toBe(true);
    });

    expect(result.current.requestCameraPermission).toBe(mockRequestCamera);
    expect(result.current.requestMicrophonePermission).toBe(mockRequestMic);
    expect(result.current.requestMediaLibraryPermission).toBe(mockRequestMedia);
  });

  it('uses resolved request results for camera access before hook flags update', async () => {
    mockRequestCamera.mockResolvedValueOnce(true);
    mockRequestMic.mockResolvedValueOnce(true);

    const { result } = renderHook(() => useLensPermissions());

    await waitFor(() => {
      expect(result.current.hasCameraAccess).toBe(true);
    });
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
  });
});
