import { COLOR_LENS_MODE } from '@features/Lens/ColorPalette/colorLensMode';
import { ColorPaletteImageInspector } from '@features/Lens/ColorPalette/ColorPaletteImageInspector';
import type { InspectionAsset } from '@features/Lens/ColorPalette/types';
import { renderWithContext } from '@testing/renderWithContext';
import { fireEvent, screen } from '@testing-library/react-native';
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

const createPointInspectionAsset = (id: string): InspectionAsset => ({
  id,
  uri: `file:///${id}.jpg`,
  mediaType: 'photo',
  width: 100,
  height: 100,
  type: COLOR_LENS_MODE.LENS_POINT,
  lensPointColor: { hex: '#AABBCC' },
});

const createNamedPointInspectionAsset = (id: string): InspectionAsset => ({
  id,
  uri: `file:///${id}.jpg`,
  mediaType: 'photo',
  width: 100,
  height: 100,
  type: COLOR_LENS_MODE.LENS_POINT,
  lensPointColor: {
    hex: '#AABBCC',
    name: 'Ice',
    pantoneCode: '15-4020',
    pantoneName: 'cerulean',
  },
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

  it('renders one swatch for lens-point inspection assets', async () => {
    renderWithContext(
      <ColorPaletteImageInspector image={createPointInspectionAsset('photo-2')} />
    );

    expect(await screen.findAllByTestId('lens-inspector-swatch')).toHaveLength(1);
  });

  it('shows name, hex, and pantone in order when a named swatch is selected', async () => {
    renderWithContext(
      <ColorPaletteImageInspector image={createNamedPointInspectionAsset('photo-3')} />
    );

    fireEvent.press(await screen.findByTestId('lens-inspector-swatch'));

    expect(await screen.findByTestId('lens-inspector-color-name')).toHaveTextContent('Ice');
    expect(screen.getByTestId('lens-inspector-color-hex')).toHaveTextContent('#AABBCC');
    expect(screen.getByTestId('lens-inspector-color-pantone')).toHaveTextContent(
      'Pantone 15-4020 Cerulean'
    );
  });

  it('shows only hex when enrichment is missing', async () => {
    renderWithContext(
      <ColorPaletteImageInspector image={createPointInspectionAsset('photo-4')} />
    );

    fireEvent.press(await screen.findByTestId('lens-inspector-swatch'));

    expect(await screen.findByTestId('lens-inspector-color-hex')).toHaveTextContent('#AABBCC');
    expect(screen.queryByTestId('lens-inspector-color-name')).toBeNull();
    expect(screen.queryByTestId('lens-inspector-color-pantone')).toBeNull();
  });
});
