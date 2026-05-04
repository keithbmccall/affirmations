import { Modal } from '@components/modal';
import { ColorPaletteImageInspector } from '@features/Lens/ColorPalette/ColorPaletteImageInspector';
import type { InspectionAsset } from '@features/Lens/ColorPalette/types';
import type { ScreenContainerProps } from '@shared-types/ScreenContainerProps';
import { memo, useMemo } from 'react';

interface CameraRollInspectorProps extends ScreenContainerProps {
  asset: string;
}

export const CameraRollInspector = memo(function CameraRollInspector({
  asset,
}: CameraRollInspectorProps) {
  const parsedAsset: InspectionAsset = useMemo(() => {
    return JSON.parse(asset) as InspectionAsset;
  }, [asset]);

  return (
    <Modal title="Camera Roll Inspector" testID="camera-roll-inspector-title" enableBackButton>
      <ColorPaletteImageInspector image={parsedAsset} />
    </Modal>
  );
});
