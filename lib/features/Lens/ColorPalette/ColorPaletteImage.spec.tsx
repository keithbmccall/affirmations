import { COLOR_LENS_MODE } from '@features/Lens/ColorPalette/colorLensMode';
import { ColorPaletteImage } from '@features/Lens/ColorPalette/ColorPaletteImage';
import type { LensPalette } from '@features/Lens/ColorPalette/types';
import { renderWithContext } from '@testing/renderWithContext';
import { screen } from '@testing-library/react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import type { Asset } from 'expo-media-library';

jest.mock('expo-image', () => {
  const { View } = jest.requireActual<typeof import('react-native')>('react-native');
  return {
    Image: ({ style }: { style?: StyleProp<ViewStyle> }) => (
      <View testID="color-palette-image" style={style} />
    ),
  };
});

const createAsset = (id: string): Asset =>
  ({
    id,
    uri: `file:///${id}.jpg`,
    mediaType: 'photo',
    width: 100,
    height: 100,
    filename: `${id}.jpg`,
    creationTime: 0,
    modificationTime: 0,
    duration: 0,
  }) as Asset;

const dominantPalette: LensPalette = {
  id: 'photo-1',
  uri: 'file:///photo-1.jpg',
  mediaType: 'photo',
  type: COLOR_LENS_MODE.LENS_DOMINANT,
  palette: {
    primaryColor: '#111111',
    secondaryColor: '#222222',
    tertiaryColor: '#333333',
    quaternaryColor: '#444444',
    quinaryColor: '#555555',
    senaryColor: '#666666',
    backgroundColor: '#777777',
    detailColor: '#888888',
  },
};

const pointPalette: LensPalette = {
  id: 'photo-2',
  uri: 'file:///photo-2.jpg',
  mediaType: 'photo',
  type: COLOR_LENS_MODE.LENS_POINT,
  lensPointColor: '#AABBCC',
};

describe('ColorPaletteImage', () => {
  it('applies cellSize to the image dimensions when provided', async () => {
    renderWithContext(<ColorPaletteImage image={createAsset('photo-1')} cellSize={120} />);

    const image = await screen.findByTestId('color-palette-image');
    const flattenedStyle = Array.isArray(image.props.style)
      ? Object.assign({}, ...image.props.style)
      : image.props.style;

    expect(flattenedStyle).toMatchObject({ width: 120, height: 120 });
  });

  it('renders eight dominant swatches for lens-dominant entries', async () => {
    renderWithContext(
      <ColorPaletteImage image={createAsset('photo-1')} lensPalette={dominantPalette} />
    );

    expect(await screen.findAllByTestId('lens-dominant-swatch')).toHaveLength(8);
    expect(screen.queryByTestId('lens-point-swatch')).toBeNull();
  });

  it('renders a single swatch for lens-point entries', async () => {
    renderWithContext(
      <ColorPaletteImage image={createAsset('photo-2')} lensPalette={pointPalette} />
    );

    expect(await screen.findByTestId('lens-point-swatch')).toBeTruthy();
    expect(screen.queryAllByTestId('lens-dominant-swatch')).toHaveLength(0);
  });
});
