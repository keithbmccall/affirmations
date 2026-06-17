import { ColorPaletteImage } from '@features/Lens/ColorPalette/ColorPaletteImage';
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

describe('ColorPaletteImage', () => {
  it('applies cellSize to the image dimensions when provided', async () => {
    renderWithContext(<ColorPaletteImage image={createAsset('photo-1')} cellSize={120} />);

    const image = await screen.findByTestId('color-palette-image');
    const flattenedStyle = Array.isArray(image.props.style)
      ? Object.assign({}, ...image.props.style)
      : image.props.style;

    expect(flattenedStyle).toMatchObject({ width: 120, height: 120 });
  });
});
