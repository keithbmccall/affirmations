import type { CameraRollMediaAsset } from '@features/Lens/Camera/cameraRollPhotos/CameraRollMediaAsset';
import { CAMERA_ROLL_MEDIA_TYPE } from '@features/Lens/Camera/cameraRollPhotos/cameraRollMediaTypes';
import { queryCameraRollMediaAssets } from '@features/Lens/Camera/cameraRollPhotos/queryCameraRollMediaAssets';
import { Routes } from '@routes/routes';
import { renderHook, act } from '@testing-library/react-native';
import { router } from 'expo-router';
import { Alert } from 'react-native';
import { useCameraRoll } from './useCameraRoll';

jest.mock('@platform', () => ({
  useLens: () => ({
    lensPalettesMap: {},
  }),
}));

jest.mock('@features/Lens/Camera/cameraRollPhotos/queryCameraRollMediaAssets', () => ({
  queryCameraRollMediaAssets: jest.fn(),
}));

jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
  },
}));

const mockedQueryCameraRollMediaAssets = queryCameraRollMediaAssets as jest.MockedFunction<
  typeof queryCameraRollMediaAssets
>;
const mockedRouterPush = router.push as jest.Mock;

const createAsset = (id: string, uri: string): CameraRollMediaAsset => ({
  id,
  uri,
  mediaType: 'image',
  width: 100,
  height: 100,
  filename: `${id}.jpg`,
  creationTime: 0,
  modificationTime: 0,
  duration: 0,
});

describe('useCameraRoll', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('opens camera roll route on press', async () => {
    const { result } = renderHook(() => useCameraRoll());

    await act(async () => {
      await result.current.handleCameraRollPress();
    });

    expect(mockedRouterPush).toHaveBeenCalledWith(Routes.modals.lensCameraRoll.routePathname);
  });

  it('alerts when router.push throws', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    mockedRouterPush.mockImplementationOnce(() => {
      throw new Error('nav fail');
    });

    const { result } = renderHook(() => useCameraRoll());

    await act(async () => {
      await result.current.handleCameraRollPress();
    });

    expect(alertSpy).toHaveBeenCalledWith('Error', 'Failed to open camera roll');
    alertSpy.mockRestore();
    mockedRouterPush.mockImplementation(() => {});
  });

  it('opens camera roll inspector with most recent photo on long press', async () => {
    mockedQueryCameraRollMediaAssets.mockResolvedValue({
      assets: [createAsset('photo-1', 'file:///photo-1.jpg')],
      hasMore: false,
    });

    const { result } = renderHook(() => useCameraRoll());

    await act(async () => {
      await result.current.fetchRecentMedia();
    });

    await act(async () => {
      await result.current.handleCameraRollLongPress();
    });

    expect(mockedRouterPush).toHaveBeenCalledWith({
      pathname: Routes.subRoutes.cameraRollInspector.routePathname,
      params: {
        asset: expect.stringContaining('"id":"photo-1"'),
      },
    });
  });

  it('does nothing on long press when no recent photo exists', async () => {
    const { result } = renderHook(() => useCameraRoll());

    await act(async () => {
      await result.current.handleCameraRollLongPress();
    });

    expect(mockedRouterPush).not.toHaveBeenCalled();
  });

  it('alerts when inspector navigation throws', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    mockedQueryCameraRollMediaAssets.mockResolvedValue({
      assets: [createAsset('photo-1', 'file:///photo-1.jpg')],
      hasMore: false,
    });
    mockedRouterPush.mockImplementationOnce(() => {
      throw new Error('nav fail');
    });

    const { result } = renderHook(() => useCameraRoll());

    await act(async () => {
      await result.current.fetchRecentMedia();
    });

    await act(async () => {
      await result.current.handleCameraRollLongPress();
    });

    expect(alertSpy).toHaveBeenCalledWith('Error', 'Failed to open photo');
    alertSpy.mockRestore();
    mockedRouterPush.mockImplementation(() => {});
  });

  it('sets recent media when assets are returned', async () => {
    mockedQueryCameraRollMediaAssets.mockResolvedValue({
      assets: [createAsset('photo-1', 'file:///photo-1.jpg')],
      hasMore: false,
    });

    const { result } = renderHook(() => useCameraRoll());

    await act(async () => {
      await result.current.fetchRecentMedia();
    });

    expect(result.current.recentMedia).toBe('file:///photo-1.jpg');
    expect(mockedQueryCameraRollMediaAssets).toHaveBeenCalledWith({
      limit: 1,
      offset: 0,
      mediaTypes: [CAMERA_ROLL_MEDIA_TYPE.IMAGE, CAMERA_ROLL_MEDIA_TYPE.VIDEO],
    });
  });

  it('does not update when asset list is empty', async () => {
    mockedQueryCameraRollMediaAssets.mockResolvedValue({
      assets: [],
      hasMore: false,
    });

    const { result } = renderHook(() => useCameraRoll());

    await act(async () => {
      await result.current.fetchRecentMedia();
    });

    expect(result.current.recentMedia).toBeNull();
  });

  it('updates media when uri changes and runs transition branch', async () => {
    mockedQueryCameraRollMediaAssets
      .mockResolvedValueOnce({
        assets: [createAsset('a', 'file:///a.jpg')],
        hasMore: false,
      })
      .mockResolvedValueOnce({
        assets: [createAsset('b', 'file:///b.jpg')],
        hasMore: false,
      });

    const { result } = renderHook(() => useCameraRoll());

    await act(async () => {
      await result.current.fetchRecentMedia();
    });
    expect(result.current.recentMedia).toBe('file:///a.jpg');

    await act(async () => {
      await result.current.fetchRecentMedia();
    });
    expect(result.current.recentMedia).toBe('file:///b.jpg');
  });

  it('sets media without transition when uri unchanged', async () => {
    mockedQueryCameraRollMediaAssets.mockResolvedValue({
      assets: [createAsset('same', 'file:///same.jpg')],
      hasMore: false,
    });

    const { result } = renderHook(() => useCameraRoll());

    await act(async () => {
      await result.current.fetchRecentMedia();
    });
    await act(async () => {
      await result.current.fetchRecentMedia();
    });

    expect(result.current.recentMedia).toBe('file:///same.jpg');
    expect(mockedQueryCameraRollMediaAssets).toHaveBeenCalledTimes(2);
  });

  it('logs when queryCameraRollMediaAssets throws', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockedQueryCameraRollMediaAssets.mockRejectedValue(new Error('library error'));

    const { result } = renderHook(() => useCameraRoll());

    await act(async () => {
      await result.current.fetchRecentMedia();
    });

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
