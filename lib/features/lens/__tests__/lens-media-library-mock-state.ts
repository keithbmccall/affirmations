import type { Asset } from 'expo-media-library';

export const lensMediaLibraryMockState = {
  getAssetsAsync: jest.fn(),
  createAssetAsync: jest.fn(),
  mediaLibraryGranted: true,
  requestMediaLibraryPermission: jest.fn(async () => {}),
};

export const makeAsset = (overrides: Partial<Asset> = {}): Asset =>
  ({
    id: 'asset-1',
    uri: 'file:///photo1.jpg',
    width: 100,
    height: 100,
    mediaType: 'photo',
    creationTime: Date.now(),
    modificationTime: Date.now(),
    duration: 0,
    filename: 'photo1.jpg',
    mediaSubtypes: [],
    albumId: 'album-1',
    ...overrides,
  }) as Asset;
