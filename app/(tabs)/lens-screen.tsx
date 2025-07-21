import { IconSymbol } from '@components';
import Lens from '@screen-containers/lens';
import { StyleSheet } from 'react-native';
import ParallaxScrollView from '../../.expo-defaults/components/ParallaxScrollView';

export default function LensScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <IconSymbol size={310} color="#808080" name="camera.fill" style={styles.headerImage} />
      }
    >
      <Lens />
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
});
