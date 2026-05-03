import { ICON_MAPPING } from '@components/shared/icon-symbol/icon-mapping';

describe('icon-mapping', () => {
  it('exposes material icon names for SF symbol keys', () => {
    expect(ICON_MAPPING['house.fill']).toBe('home');
    expect(ICON_MAPPING['camera.fill']).toBe('camera-alt');
  });
});
