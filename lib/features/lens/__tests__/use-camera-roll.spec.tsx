import './lens-full-native-mocks';

import { useCameraRoll } from '@features/lens/camera/hooks/use-camera-roll';
import { flushProviderMicrotasks } from '@testing/flush-provider-microtasks';
import { renderWithContext } from '@testing/render-with-context';
import { act, fireEvent, screen } from 'expo-router/testing-library';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { lensMediaLibraryMockState, makeAsset } from './lens-media-library-mock-state';

function CameraRollHarness({ hasAllPermissions }: { hasAllPermissions: boolean }) {
  const { fetchRecentMedia, recentMedia } = useCameraRoll(hasAllPermissions);
  return (
    <View>
      <Text testID="recent-uri">{recentMedia ?? 'none'}</Text>
      <Pressable testID="fetch-recent" onPress={() => void fetchRecentMedia()}>
        <Text>Fetch</Text>
      </Pressable>
    </View>
  );
}

describe('use-camera-roll.ts', () => {
  beforeEach(() => {
    lensMediaLibraryMockState.getAssetsAsync.mockReset();
  });

  it('sets recent media on first fetch when permissions are granted', async () => {
    lensMediaLibraryMockState.getAssetsAsync.mockResolvedValue({
      assets: [makeAsset({ id: 'a1', uri: 'file:///first.jpg' })],
      endCursor: null,
      hasNextPage: false,
      totalCount: 1,
    });
    renderWithContext(<CameraRollHarness hasAllPermissions />);
    await act(async () => {
      fireEvent.press(screen.getByTestId('fetch-recent'));
      await flushProviderMicrotasks();
    });
    expect(screen.getByTestId('recent-uri').props.children).toBe('file:///first.jpg');
  });

  it('updates media when a new uri differs from the previous one', async () => {
    lensMediaLibraryMockState.getAssetsAsync
      .mockResolvedValueOnce({
        assets: [makeAsset({ id: 'a1', uri: 'file:///first.jpg' })],
        endCursor: null,
        hasNextPage: false,
        totalCount: 1,
      })
      .mockResolvedValueOnce({
        assets: [makeAsset({ id: 'a2', uri: 'file:///second.jpg' })],
        endCursor: null,
        hasNextPage: false,
        totalCount: 1,
      });

    renderWithContext(<CameraRollHarness hasAllPermissions />);
    await act(async () => {
      fireEvent.press(screen.getByTestId('fetch-recent'));
      await flushProviderMicrotasks();
    });
    expect(screen.getByTestId('recent-uri').props.children).toBe('file:///first.jpg');

    await act(async () => {
      fireEvent.press(screen.getByTestId('fetch-recent'));
      await flushProviderMicrotasks();
    });
    expect(screen.getByTestId('recent-uri').props.children).toBe('file:///second.jpg');
  });

  it('does not fetch when permissions are missing', async () => {
    renderWithContext(<CameraRollHarness hasAllPermissions={false} />);
    await act(async () => {
      fireEvent.press(screen.getByTestId('fetch-recent'));
      await flushProviderMicrotasks();
    });
    expect(lensMediaLibraryMockState.getAssetsAsync).not.toHaveBeenCalled();
  });

  it('skips transition animation when the latest uri matches the previous one', async () => {
    lensMediaLibraryMockState.getAssetsAsync.mockResolvedValue({
      assets: [makeAsset({ id: 'a1', uri: 'file:///same.jpg' })],
      endCursor: null,
      hasNextPage: false,
      totalCount: 1,
    });
    renderWithContext(<CameraRollHarness hasAllPermissions />);
    await act(async () => {
      fireEvent.press(screen.getByTestId('fetch-recent'));
      await flushProviderMicrotasks();
    });
    await act(async () => {
      fireEvent.press(screen.getByTestId('fetch-recent'));
      await flushProviderMicrotasks();
    });
    expect(screen.getByTestId('recent-uri').props.children).toBe('file:///same.jpg');
  });

  it('does not update media when the library returns no assets', async () => {
    lensMediaLibraryMockState.getAssetsAsync.mockResolvedValue({
      assets: [],
      endCursor: null,
      hasNextPage: false,
      totalCount: 0,
    });
    renderWithContext(<CameraRollHarness hasAllPermissions />);
    await act(async () => {
      fireEvent.press(screen.getByTestId('fetch-recent'));
      await flushProviderMicrotasks();
    });
    expect(screen.getByTestId('recent-uri').props.children).toBe('none');
  });

  it('logs when fetching recent media fails', async () => {
    const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    lensMediaLibraryMockState.getAssetsAsync.mockRejectedValueOnce(new Error('roll'));
    renderWithContext(<CameraRollHarness hasAllPermissions />);
    await act(async () => {
      fireEvent.press(screen.getByTestId('fetch-recent'));
      await flushProviderMicrotasks();
    });
    expect(errSpy).toHaveBeenCalled();
    errSpy.mockRestore();
  });
});
