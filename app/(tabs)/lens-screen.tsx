import { IconSymbol } from '@/lib/components/shared/icon-symbol/icon-symbol';
import { ThemedText } from '@/lib/components/shared/themed-text';
import { StyleSheet } from 'react-native';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import ParallaxScrollView from "@/.expo-defaults/components/ParallaxScrollView";

export default function LensScreen() {
  const device = useCameraDevice('back');
  const { hasPermission } = useCameraPermission();

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <IconSymbol size={310} color="#808080" name="camera.fill" style={styles.headerImage} />
      }
    >
      {device ? (
        <>
          <Camera style={StyleSheet.absoluteFill} device={device} isActive={true} />)
          <ThemedText type="title">Lens</ThemedText>
          <ThemedText type="default">Add camera here</ThemedText>
        </>
      ) : (
        <ThemedText type="title">No camera</ThemedText>
      )}
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
