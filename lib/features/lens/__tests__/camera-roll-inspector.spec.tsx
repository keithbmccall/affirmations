import { CameraRollInspector } from '@features/lens/camera-roll-inspector';
import { renderWithContext } from '@testing/render-with-context';
import { fireEvent, screen } from 'expo-router/testing-library';
import React from 'react';

const paletteFixture = {
  primaryColor: '#010101',
  secondaryColor: '#020202',
  tertiaryColor: '#030303',
  quaternaryColor: '#040404',
  quinaryColor: '#050505',
  senaryColor: '#060606',
  backgroundColor: '#070707',
  detailColor: '#080808',
};

const inspectionAssetJson = JSON.stringify({
  id: 'insp-1',
  uri: 'file:///inspect.jpg',
  mediaType: 'photo',
  height: 200,
  width: 200,
  palette: {
    ...paletteFixture,
  },
});

const inspectionAssetPartialPaletteJson = JSON.stringify({
  id: 'insp-2',
  uri: 'file:///inspect2.jpg',
  mediaType: 'photo',
  height: 200,
  width: 200,
  palette: {
    primaryColor: '#aaaaaa',
    secondaryColor: '#bbbbbb',
  },
});

describe('camera-roll-inspector.tsx', () => {
  it('renders inspector title and palette interactions', async () => {
    renderWithContext(<CameraRollInspector asset={inspectionAssetJson} />);
    expect(await screen.findByTestId('camera-roll-inspector-title')).toBeOnTheScreen();

    const swatches = screen.getAllByTestId('lens-inspector-swatch');
    expect(swatches.length).toBeGreaterThan(1);
    fireEvent.press(swatches[0]);
    fireEvent.press(swatches[1]);
    fireEvent.press(swatches[0]);
    const close = await screen.findByText('Close');
    fireEvent.press(close);
  });

  it('skips null swatches for partial palette JSON', async () => {
    renderWithContext(<CameraRollInspector asset={inspectionAssetPartialPaletteJson} />);
    expect(await screen.findByTestId('camera-roll-inspector-title')).toBeOnTheScreen();
  });
});
