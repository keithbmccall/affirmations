import { renderWithContext } from '@testing/render-with-context';
import React from 'react';
import { Text } from 'react-native';

const { IconSymbol } = require('../icon-symbol.tsx') as typeof import('../icon-symbol');

describe('IconSymbol (Material fallback)', () => {
  it('renders MaterialIcons for the non-iOS implementation', () => {
    const { UNSAFE_root } = renderWithContext(
      <IconSymbol name="house.fill" color="#000000" style={{ opacity: 0.5 }} />
    );
    expect(UNSAFE_root.findAllByType(Text).length).toBeGreaterThan(0);
  });
});
