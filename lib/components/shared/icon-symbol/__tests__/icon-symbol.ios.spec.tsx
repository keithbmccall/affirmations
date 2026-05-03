import { renderWithContext } from '@testing/render-with-context';
import { screen } from 'expo-router/testing-library';
import React from 'react';
import { View } from 'react-native';

const { IconSymbol } = require('../icon-symbol.ios.tsx') as typeof import('../icon-symbol.ios');

describe('IconSymbol (iOS SF Symbols)', () => {
  it('forwards weight and sizing props to SymbolView', () => {
    renderWithContext(
      <View testID="wrap">
        <IconSymbol name="house.fill" color="#112233" size={28} weight="bold" />
      </View>
    );
    expect(screen.getByTestId('wrap')).toBeOnTheScreen();
  });

  it('uses the regular weight by default', () => {
    renderWithContext(
      <View testID="wrap-regular">
        <IconSymbol name="house.fill" color="#112233" />
      </View>
    );
    expect(screen.getByTestId('wrap-regular')).toBeOnTheScreen();
  });
});
