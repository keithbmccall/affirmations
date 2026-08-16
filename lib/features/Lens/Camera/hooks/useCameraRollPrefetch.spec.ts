import { useCameraRollPrefetch } from '@features/Lens/Camera/hooks/useCameraRollPrefetch';
import { prefetchCameraRollPhotos } from '@features/Lens/Camera/cameraRollPhotos/prefetchCameraRollPhotos';
import { renderHook } from '@testing-library/react-native';

jest.mock('@features/Lens/Camera/cameraRollPhotos/prefetchCameraRollPhotos', () => ({
  prefetchCameraRollPhotos: jest.fn(() => Promise.resolve()),
}));

const mockPrefetchCameraRollPhotos = prefetchCameraRollPhotos as jest.MockedFunction<
  typeof prefetchCameraRollPhotos
>;

describe('useCameraRollPrefetch', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('prefetches camera roll photos on mount', () => {
    renderHook(() => useCameraRollPrefetch());

    expect(mockPrefetchCameraRollPhotos).toHaveBeenCalledTimes(1);
  });
});
