import { ColorPaletteImageInspector } from '@features/Lens/ColorPalette/ColorPaletteImageInspector';
import type { InspectionAsset } from '@features/Lens/ColorPalette/types';
import { renderWithContext } from '@testing/renderWithContext';
import { screen } from '@testing-library/react-native';
import type { StyleProp, ViewStyle } from 'react-native';

jest.mock('expo-image', () => {
  const { View } = jest.requireActual<typeof import('react-native')>('react-native');
  return {
    Image: ({ style }: { style?: StyleProp<ViewStyle> }) => (
      <View testID="color-palette-inspector-image" style={style} />
    ),
  };
});

const createInspectionAsset = (id: string): InspectionAsset => ({
  id,
  uri: `file:///${id}.jpg`,
  mediaType: 'photo',
  width: 100,
  height: 100,
});

describe('ColorPaletteImageInspector', () => {
  it('fills the palette curtain with an absolute-fill image', async () => {
    renderWithContext(<ColorPaletteImageInspector image={createInspectionAsset('photo-1')} />);

    const image = await screen.findByTestId('color-palette-inspector-image');
    const flattenedStyle = Array.isArray(image.props.style)
      ? Object.assign({}, ...image.props.style)
      : image.props.style;

    expect(flattenedStyle).toMatchObject({
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    });
  });
});
