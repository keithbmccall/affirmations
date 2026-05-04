import { renderHook, act } from '@testing-library/react-native';
import { getAssetsAsync } from 'expo-media-library';
import { router } from 'expo-router';
import { Alert } from 'react-native';

import { Routes } from '@routes/routes';

import { useCameraRoll } from './useCameraRoll';

jest.mock('expo-media-library', () => ({
  getAssetsAsync: jest.fn(),
}));

jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
  },
}));

const mockedGetAssetsAsync = getAssetsAsync as jest.MockedFunction<typeof getAssetsAsync>;
const mockedRouterPush = router.push as jest.Mock;

describe('useCameraRoll', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('opens camera roll route on press', async () => {
    const { result } = renderHook(() => useCameraRoll(true));

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

    const { result } = renderHook(() => useCameraRoll(true));

    await act(async () => {
      await result.current.handleCameraRollPress();
    });

    expect(alertSpy).toHaveBeenCalledWith('Error', 'Failed to open camera roll');
    alertSpy.mockRestore();
    mockedRouterPush.mockImplementation(() => {});
  });

  it('does not fetch when permissions are false', async () => {
    const { result } = renderHook(() => useCameraRoll(false));

    await act(async () => {
      await result.current.fetchRecentMedia();
    });

    expect(mockedGetAssetsAsync).not.toHaveBeenCalled();
  });

  it('sets recent media when assets are returned', async () => {
    mockedGetAssetsAsync.mockResolvedValue({
      assets: [{ uri: 'file:///photo-1.jpg' }],
      totalCount: 1,
      hasNextPage: false,
    } as never);

    const { result } = renderHook(() => useCameraRoll(true));

    await act(async () => {
      await result.current.fetchRecentMedia();
    });

    expect(result.current.recentMedia).toBe('file:///photo-1.jpg');
  });

  it('does not update when asset list is empty', async () => {
    mockedGetAssetsAsync.mockResolvedValue({
      assets: [],
      totalCount: 0,
      hasNextPage: false,
    } as never);

    const { result } = renderHook(() => useCameraRoll(true));

    await act(async () => {
      await result.current.fetchRecentMedia();
    });

    expect(result.current.recentMedia).toBeNull();
  });

  it('updates media when uri changes and runs transition branch', async () => {
    mockedGetAssetsAsync
      .mockResolvedValueOnce({
        assets: [{ uri: 'file:///a.jpg' }],
        totalCount: 1,
        hasNextPage: false,
      } as never)
      .mockResolvedValueOnce({
        assets: [{ uri: 'file:///b.jpg' }],
        totalCount: 1,
        hasNextPage: false,
      } as never);

    const { result } = renderHook(() => useCameraRoll(true));

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
    mockedGetAssetsAsync.mockResolvedValue({
      assets: [{ uri: 'file:///same.jpg' }],
      totalCount: 1,
      hasNextPage: false,
    } as never);

    const { result } = renderHook(() => useCameraRoll(true));

    await act(async () => {
      await result.current.fetchRecentMedia();
    });
    await act(async () => {
      await result.current.fetchRecentMedia();
    });

    expect(result.current.recentMedia).toBe('file:///same.jpg');
    expect(mockedGetAssetsAsync).toHaveBeenCalledTimes(2);
  });

  it('logs when getAssetsAsync throws', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockedGetAssetsAsync.mockRejectedValue(new Error('library error'));

    const { result } = renderHook(() => useCameraRoll(true));

    await act(async () => {
      await result.current.fetchRecentMedia();
    });

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
