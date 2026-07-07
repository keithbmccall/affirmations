import { useCameraRollPrefetch } from '@features/Lens/Camera/hooks/useCameraRollPrefetch';
import { prefetchCameraRollPhotos } from '@features/Lens/Camera/cameraRollPhotos/prefetchCameraRollPhotos';
import { renderHook } from '@testing-library/react-native';

jest.mock('@features/Lens/Camera/cameraRollPhotos/prefetchCameraRollPhotos', () => ({
  prefetchCameraRollPhotos: jest.fn(() => Promise.resolve()),
}));

const mockPrefetchCameraRollPhotos = prefetchCameraRollPhotos as jest.MockedFunction<
  typeof prefetchCameraRollPhotos
>;

let mockMediaLibraryPermission = false;

jest.mock('@features/Lens/Camera/hooks/useLensPermissions', () => ({
  useLensPermissions: () => ({
    mediaLibraryPermission: mockMediaLibraryPermission,
  }),
}));

describe('useCameraRollPrefetch', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockMediaLibraryPermission = false;
  });

  it('does not prefetch when media library permission is not granted', () => {
    renderHook(() => useCameraRollPrefetch());

    expect(mockPrefetchCameraRollPhotos).not.toHaveBeenCalled();
  });

  it('prefetches camera roll photos when media library permission is granted', () => {
    mockMediaLibraryPermission = true;

    renderHook(() => useCameraRollPrefetch());

    expect(mockPrefetchCameraRollPhotos).toHaveBeenCalledTimes(1);
  });
});
