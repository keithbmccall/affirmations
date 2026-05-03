import { Modal } from '@components/modal';
import { ColorPaletteImageInspector } from '@features/lens/lens-palette/components/color-palette-image-inspector';
import type { InspectionAsset } from '@features/lens/lens-palette/types';
import type { ScreenContainerProps } from '@shared-types/screen-container';
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
