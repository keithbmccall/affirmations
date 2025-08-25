import { CameraRollInspector } from '@screen-containers/camera-roll-inspector';
import { router } from 'expo-router';

export default function CameraRollInspectorScreen() {
  const handleBack = () => {
    router.back();
  };

  return <CameraRollInspector />;
}
