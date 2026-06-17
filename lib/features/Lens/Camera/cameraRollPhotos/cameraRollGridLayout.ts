import { Dimensions } from 'react-native';

export const CAMERA_ROLL_NUM_COLUMNS = 3;

export function getCameraRollGridCellSize(windowWidth: number): number {
  return Math.floor(windowWidth / CAMERA_ROLL_NUM_COLUMNS);
}

export const CAMERA_ROLL_GRID_CELL_SIZE = getCameraRollGridCellSize(
  Dimensions.get('window').width
);
