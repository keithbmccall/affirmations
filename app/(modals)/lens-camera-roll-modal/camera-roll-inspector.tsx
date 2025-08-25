import { CameraRollInspector } from '@screen-containers/camera-roll-inspector';
import { spacing } from '@styles';
import { router } from 'expo-router';
import { StyleSheet } from 'react-native';

export default function CameraRollInspectorScreen() {
  const handleBack = () => {
    router.back();
  };

  return <CameraRollInspector />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.screenPadding,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  description: {
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  backButton: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
});
