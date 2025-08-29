import { Modal } from '@components/modal';
import { ColorPaletteImageInspector, InspectionAsset } from '@features/lens/lens-palette';
import { ScreenContainerProps } from '@types';
import { useMemo } from 'react';

const testAsset: InspectionAsset = {
  height: 2376,
  width: 4224,
  uri: 'ph://55049931-79E4-4CB6-8CFB-338A3933B986/L0/001',
  mediaType: 'photo',
  id: '55049931-79E4-4CB6-8CFB-338A3933B986/L0/001',
  palette: {
    primaryColor: '#406050',
    secondaryColor: '#203020',
    tertiaryColor: '#609050',
    quaternaryColor: '#102010',
    quinaryColor: '#306040',
    senaryColor: '#407050',
    backgroundColor: '#406050',
    detailColor: '#203020',
  },
};
interface CameraRollInspectorProps extends ScreenContainerProps {
  asset: string;
}

export const CameraRollInspector = ({ asset }: CameraRollInspectorProps) => {
  const parsedAsset: InspectionAsset = useMemo(() => {
    return JSON.parse(asset) as InspectionAsset;
  }, [asset]);

  // TODO: remove this once we have a real asset
  const fakeAsset = {
    ...testAsset,
    uri: parsedAsset.uri,
  };

  return (
    <Modal title="Camera Roll Inspector" testID="camera-roll-inspector-title" enableBackButton>
      <ColorPaletteImageInspector image={fakeAsset} />
    </Modal>
  );
};
