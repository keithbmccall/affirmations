const mockDimensionsGet = jest.fn(() => ({ width: 391, height: 844 }));

jest.doMock('react-native', () => ({
  Dimensions: {
    get: mockDimensionsGet,
  },
}));

describe('cameraRollGridLayout', () => {
  beforeEach(() => {
    jest.resetModules();
    mockDimensionsGet.mockReturnValue({ width: 391, height: 844 });
  });

  it('computes a floored cell size that fits within the window width', () => {
    const {
      CAMERA_ROLL_GRID_CELL_SIZE,
      CAMERA_ROLL_NUM_COLUMNS,
    } = require('./cameraRollGridLayout');

    expect(CAMERA_ROLL_NUM_COLUMNS).toBe(3);
    expect(CAMERA_ROLL_GRID_CELL_SIZE).toBe(130);
    expect(CAMERA_ROLL_GRID_CELL_SIZE * CAMERA_ROLL_NUM_COLUMNS).toBeLessThanOrEqual(391);
  });

  it('uses the full window width when width divides evenly by column count', () => {
    mockDimensionsGet.mockReturnValue({ width: 390, height: 844 });

    const {
      CAMERA_ROLL_GRID_CELL_SIZE,
      CAMERA_ROLL_NUM_COLUMNS,
    } = require('./cameraRollGridLayout');

    expect(CAMERA_ROLL_GRID_CELL_SIZE).toBe(130);
    expect(CAMERA_ROLL_GRID_CELL_SIZE * CAMERA_ROLL_NUM_COLUMNS).toBe(390);
  });
});
