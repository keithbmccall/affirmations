import { Modal } from '@components/modal';
import { router } from 'expo-router';
import { Text } from 'react-native';
import { ScreenContainerProps } from 'react-native-screens';

interface CameraRollInspector extends ScreenContainerProps {}

export const CameraRollInspector = () => {
  const handleBack = () => {
    router.back();
  };
  return (
    <Modal title="Camera Roll Inspector" testID="camera-roll-inspector-title">
      <Text>Camera Roll Inspector</Text>
    </Modal>
  );
};
