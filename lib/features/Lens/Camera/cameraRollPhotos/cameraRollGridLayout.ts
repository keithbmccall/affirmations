import { Dimensions } from 'react-native';

export const CAMERA_ROLL_NUM_COLUMNS = 3;

const windowWidth = Dimensions.get('window').width;

export const CAMERA_ROLL_GRID_CELL_SIZE = Math.floor(
  windowWidth / CAMERA_ROLL_NUM_COLUMNS
);
