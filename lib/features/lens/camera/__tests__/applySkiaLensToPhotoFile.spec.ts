/* eslint-disable import/first -- jest.mock factories are hoisted; imports must follow mocks */
jest.mock('@features/lens/camera/createSkiaLensPaint', () => ({
  createSkiaLensPaint: jest.fn(() => ({ dispose: jest.fn() })),
}));

jest.mock('@shopify/react-native-skia', () => {
  const drawImage = jest.fn();
  const snapshotDispose = jest.fn();
  const surfaceDispose = jest.fn();
  const imageDispose = jest.fn();
  const dataDispose = jest.fn();

  const mockSnapshot = {
    encodeToBase64: jest.fn(() => 'QQ=='),
    dispose: snapshotDispose,
  };

  const mockSurface = {
    getCanvas: jest.fn(() => ({ drawImage })),
    flush: jest.fn(),
    makeImageSnapshot: jest.fn(() => mockSnapshot),
    dispose: surfaceDispose,
  };

  return {
    ImageFormat: { JPEG: 3, PNG: 4, WEBP: 6 },
    Skia: {
      Data: {
        fromURI: jest.fn(async () => ({ dispose: dataDispose })),
      },
      Image: {
        MakeImageFromEncoded: jest.fn(() => ({
          width: () => 640,
          height: () => 480,
          dispose: imageDispose,
        })),
      },
      Surface: {
        MakeOffscreen: jest.fn(() => mockSurface),
      },
    },
  };
});

jest.mock('expo-file-system', () => ({
  cacheDirectory: 'file:///cache-dir/',
  EncodingType: { Base64: 'base64', UTF8: 'utf8' },
  writeAsStringAsync: jest.fn(async () => undefined),
}));

import { applySkiaLensToPhotoFile } from '@features/lens/camera/applySkiaLensToPhotoFile';
import { SKIA_COLOR_MODE } from '@features/lens/camera/camera-options';
import { createSkiaLensPaint } from '@features/lens/camera/createSkiaLensPaint';
import { Skia } from '@shopify/react-native-skia';
import * as FileSystem from 'expo-file-system';

describe('applySkiaLensToPhotoFile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('runs decode → offscreen draw → JPEG encode → write, and returns cache file URI', async () => {
    const uri = await applySkiaLensToPhotoFile({
      inputPath: '/tmp/in.jpg',
      colorMode: SKIA_COLOR_MODE.DEFAULT,
    });

    expect(createSkiaLensPaint).toHaveBeenCalledWith(SKIA_COLOR_MODE.DEFAULT, {
      outputShortSidePx: 480,
    });
    expect(Skia.Data.fromURI).toHaveBeenCalledWith('file:///tmp/in.jpg');
    expect(Skia.Image.MakeImageFromEncoded).toHaveBeenCalled();
    expect(Skia.Surface.MakeOffscreen).toHaveBeenCalledWith(640, 480);

    const surface = (Skia.Surface.MakeOffscreen as jest.Mock).mock.results[0].value;
    expect(surface.getCanvas).toHaveBeenCalled();
    const canvas = surface.getCanvas.mock.results[0].value;
    expect(canvas.drawImage).toHaveBeenCalled();
    expect(surface.flush).toHaveBeenCalled();
    expect(surface.makeImageSnapshot).toHaveBeenCalled();

    expect(FileSystem.writeAsStringAsync).toHaveBeenCalledTimes(1);
    const [writtenPath, contents, opts] = (FileSystem.writeAsStringAsync as jest.Mock).mock.calls[0];
    expect(writtenPath).toBe(uri);
    expect(contents).toBe('QQ==');
    expect(opts).toEqual({ encoding: 'base64' });
    expect(uri.startsWith('file:///cache-dir/lens-skia-')).toBe(true);
    expect(uri.endsWith('.jpg')).toBe(true);
  });

  it('normalizes file URI when input has no file scheme', async () => {
    await applySkiaLensToPhotoFile({
      inputPath: '  /data/tmp/x.jpg  ',
      colorMode: SKIA_COLOR_MODE.TAME_RED,
    });
    expect(Skia.Data.fromURI).toHaveBeenCalledWith('file:///data/tmp/x.jpg');
  });
});
