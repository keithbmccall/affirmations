export const lensStorageMockState = {
  loadData: jest.fn(async (_key: string) => false as const),
  saveData: jest.fn(async (_key: string, _value: unknown) => {}),
};
