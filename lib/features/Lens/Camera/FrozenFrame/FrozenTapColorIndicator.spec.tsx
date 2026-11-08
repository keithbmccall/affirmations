import { render } from '@testing-library/react-native';
import { FrozenTapColorIndicator } from './FrozenTapColorIndicator';

describe('FrozenTapColorIndicator', () => {
  it('renders the temporary indicator at the tap with the sampled color', () => {
    const { getByTestId } = render(
      <FrozenTapColorIndicator x={120} y={240} hex="#AABBCC" />
    );

    const indicator = getByTestId('lens-frozen-tap-color-indicator');
    expect(indicator.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          left: 120 - 22,
          top: 240 - 22,
          backgroundColor: '#AABBCC',
        }),
      ])
    );
  });
});
