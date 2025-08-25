import { Modal } from '@components/modal';
import { Text } from 'react-native';
import { ScreenContainerProps } from 'react-native-screens';

interface CameraRollInspector extends ScreenContainerProps {}

export const CameraRollInspector = () => {
  return (
    <Modal title="Camera Roll Inspector" testID="camera-roll-inspector-title">
      <Text>Camera Roll Inspector</Text>
    </Modal>
  );
};
