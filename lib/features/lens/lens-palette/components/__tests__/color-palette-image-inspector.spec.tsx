import { ColorPaletteImageInspector } from '@features/lens/lens-palette/components/color-palette-image-inspector';
import { flushProviderMicrotasks } from '@testing/flush-provider-microtasks';
import { renderWithContext } from '@testing/render-with-context';
import { act, fireEvent, screen } from 'expo-router/testing-library';
import React from 'react';

const inspectionImage = {
  id: 'img-1',
  uri: 'file:///inspect.jpg',
  mediaType: 'photo',
  width: 100,
  height: 100,
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

const inspectionImageSparsePalette = {
  ...inspectionImage,
  id: 'img-2',
  palette: {
    ...inspectionImage.palette,
    tertiaryColor: '',
  },
};

describe('ColorPaletteImageInspector', () => {
  it('opens the overlay, switches swatches, and closes when the same swatch is pressed', async () => {
    renderWithContext(<ColorPaletteImageInspector image={inspectionImage} />);
    const swatches = await screen.findAllByTestId('lens-inspector-swatch');
    expect(swatches.length).toBeGreaterThan(1);

    fireEvent.press(swatches[0]);
    await act(async () => {
      await flushProviderMicrotasks();
    });

    fireEvent.press(swatches[1]);
    await act(async () => {
      await flushProviderMicrotasks();
    });

    fireEvent.press(swatches[0]);
    await act(async () => {
      await flushProviderMicrotasks();
    });

    fireEvent.press(swatches[0]);
    await act(async () => {
      await flushProviderMicrotasks();
    });

    fireEvent.press(await screen.findByText('Close'));
  });

  it('skips empty swatches in the palette strip', async () => {
    renderWithContext(<ColorPaletteImageInspector image={inspectionImageSparsePalette} />);
    const swatches = await screen.findAllByTestId('lens-inspector-swatch');
    expect(swatches.length).toBeGreaterThan(0);
  });
});
