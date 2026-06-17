import {
  CAMERA_ROLL_NUM_COLUMNS,
  getCameraRollGridCellSize,
} from './cameraRollGridLayout';

describe('cameraRollGridLayout', () => {
  it('computes a floored cell size that fits within the window width', () => {
    const cellSize = getCameraRollGridCellSize(391);

    expect(CAMERA_ROLL_NUM_COLUMNS).toBe(3);
    expect(cellSize).toBe(130);
    expect(cellSize * CAMERA_ROLL_NUM_COLUMNS).toBeLessThanOrEqual(391);
  });

  it('uses the full window width when width divides evenly by column count', () => {
    const cellSize = getCameraRollGridCellSize(390);

    expect(cellSize).toBe(130);
    expect(cellSize * CAMERA_ROLL_NUM_COLUMNS).toBe(390);
  });
});
