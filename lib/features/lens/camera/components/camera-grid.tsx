import { Divider } from '@components/shared/divider';
import { colors } from '@styles/colors';
import { globalStyles } from '@styles/global-styles';
import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

export const CameraGrid = memo(function CameraGrid() {
  return (
    <>
      <View style={styles.gridOverlayColumn}>
        <Divider />
        <Divider />
      </View>
      <View style={styles.gridOverlayRow}>
        <Divider vertical />
        <Divider vertical />
      </View>
    </>
  );
});

const styles = StyleSheet.create({
  gridOverlayColumn: {
    ...globalStyles.absoluteFill,
    backgroundColor: colors.human.transparent,
    ...globalStyles.flexColumn,
    ...globalStyles.justifyEvenly,
  },
  gridOverlayRow: {
    ...globalStyles.absoluteFill,
    backgroundColor: colors.human.transparent,
    ...globalStyles.flexRow,
    ...globalStyles.justifyEvenly,
  },
});
