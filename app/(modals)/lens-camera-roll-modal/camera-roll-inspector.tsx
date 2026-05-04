import { useLocalSearchParams } from 'expo-router';
import { CameraRollInspector } from '../../../lib/features/Lens/CameraRollInspector';

export default function CameraRollInspectorScreen() {
  const { asset } = useLocalSearchParams<{ asset: string }>();

  return <CameraRollInspector asset={asset} />;
}
