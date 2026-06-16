import { mergePhotosAtHead } from '@features/Lens/Camera/cameraRollPhotos/mergePhotosAtHead';
import type { Asset } from 'expo-media-library';

const createAsset = (id: string, creationTime: number): Asset =>
  ({
    id,
    uri: `file:///${id}.jpg`,
    mediaType: 'photo',
    width: 100,
    height: 100,
    filename: `${id}.jpg`,
    creationTime,
    modificationTime: 0,
    duration: 0,
  }) as Asset;

describe('mergePhotosAtHead', () => {
  it('returns existing when head is empty', () => {
    const existing = [createAsset('photo-1', 100), createAsset('photo-2', 90)];

    expect(mergePhotosAtHead(existing, [])).toBe(existing);
  });

  it('returns head when existing is empty', () => {
    const head = [createAsset('photo-new', 200)];

    expect(mergePhotosAtHead([], head)).toBe(head);
  });

  it('merges new head photos ahead of existing tail without duplicate ids', () => {
    const existing = [
      createAsset('photo-1', 100),
      createAsset('photo-2', 90),
      createAsset('photo-3', 80),
    ];
    const head = [createAsset('photo-new', 200), createAsset('photo-2', 90)];

    const merged = mergePhotosAtHead(existing, head);

    expect(merged.map(asset => asset.id)).toEqual(['photo-new', 'photo-2', 'photo-1', 'photo-3']);
  });

  it('returns the same existing reference when head ids match the prefix', () => {
    const existing = [
      createAsset('photo-1', 100),
      createAsset('photo-2', 90),
      createAsset('photo-3', 80),
    ];
    const head = [createAsset('photo-1', 100), createAsset('photo-2', 90)];

    expect(mergePhotosAtHead(existing, head)).toBe(existing);
  });

  it('retains orphaned prefix photos not present in head', () => {
    const existing = [
      createAsset('photo-deleted', 110),
      createAsset('photo-1', 100),
      createAsset('photo-2', 90),
    ];
    const head = [createAsset('photo-new', 200), createAsset('photo-1', 100)];

    const merged = mergePhotosAtHead(existing, head);

    expect(merged.map(asset => asset.id)).toEqual(['photo-new', 'photo-1', 'photo-deleted', 'photo-2']);
  });

  it('preserves suffix beyond head length without scanning it for duplicates', () => {
    const existing = Array.from({ length: 300 }, (_, index) =>
      createAsset(`photo-${index}`, 1000 - index)
    );
    const head = Array.from({ length: 30 }, (_, index) => createAsset(`photo-${index}`, 1000 - index));

    const merged = mergePhotosAtHead(existing, head);

    expect(merged).toHaveLength(300);
    expect(merged[0].id).toBe('photo-0');
    expect(merged[29].id).toBe('photo-29');
    expect(merged[30].id).toBe('photo-30');
    expect(merged[299].id).toBe('photo-299');
  });
});
