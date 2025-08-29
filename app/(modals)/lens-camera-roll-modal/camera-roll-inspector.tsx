import { useLocalSearchParams } from 'expo-router';
import { CameraRollInspector } from '../../../lib/features/lens/camera-roll-inspector';

export default function CameraRollInspectorScreen() {
  const { asset } = useLocalSearchParams<{ asset: string }>();

  return <CameraRollInspector asset={asset} />;
}
