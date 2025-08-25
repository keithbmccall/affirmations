import { Modal } from '@components/modal';
import { InspectionAsset } from '@features/lens/lens-palette';
import { Text } from 'react-native';
import { ScreenContainerProps } from 'react-native-screens';

interface CameraRollInspectorProps extends ScreenContainerProps {
  asset: string;
}

export const CameraRollInspector = ({ asset }: CameraRollInspectorProps) => {
  const parsedAsset: InspectionAsset = JSON.parse(asset) as InspectionAsset;

  console.log({
    parsedAsset,
  });

  return (
    <Modal title="Camera Roll Inspector" testID="camera-roll-inspector-title">
      <Text>Camera Roll Inspector</Text>
    </Modal>
  );
};
