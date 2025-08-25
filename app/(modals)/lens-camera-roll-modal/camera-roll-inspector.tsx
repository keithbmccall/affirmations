import { CameraRollInspector } from '@screen-containers/camera-roll-inspector';
import { useLocalSearchParams } from 'expo-router';

export default function CameraRollInspectorScreen() {
  const { asset } = useLocalSearchParams<{ asset: string }>();

  return <CameraRollInspector asset={asset} />;
}
