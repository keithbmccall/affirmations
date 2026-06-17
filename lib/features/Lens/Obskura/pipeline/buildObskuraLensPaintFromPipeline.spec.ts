import { buildObskuraLensPaintFromPipeline } from '@features/Lens/Obskura/pipeline/buildObskuraLensPaintFromPipeline';
import { buildTameRedSaturationColorMatrix } from '@features/Lens/Obskura/pipeline/matrices/buildTameRedSaturationColorMatrix';
import { buildUniformSaturationColorMatrix } from '@features/Lens/Obskura/pipeline/matrices/buildUniformSaturationColorMatrix';
import { OBSKURA_LENS_PIPELINE } from '@features/Lens/Obskura/pipeline/obskuraLensPipelineConfig';
import { OBSKURA_COLOR_MODE } from '@features/Lens/Obskura/options';

const mockSetImageFilter = jest.fn();
const mockMakeBlur = jest.fn((sigmaX: number, sigmaY: number, tileMode: unknown, input: unknown) => ({
  kind: 'blur',
  sigmaX,
  sigmaY,
  tileMode,
  input,
}));
const mockMakeErode = jest.fn((radiusX: number, radiusY: number, input: unknown) => ({
  kind: 'erode',
  radiusX,
  radiusY,
  input,
}));
const mockMakeRuntimeShader = jest.fn((builder: unknown, childShaderName: unknown, input: unknown) => ({
  kind: 'runtimeShader',
  builder,
  childShaderName,
  input,
}));
const mockMakeColorFilterImageFilter = jest.fn((colorFilter: unknown, imageFilter: unknown) => ({
  kind: 'colorFilterImageFilter',
  colorFilter,
  imageFilter,
}));
const mockMakeMatrix = jest.fn((matrix: number[]) => ({ kind: 'matrix', matrix }));
const mockMakeCompose = jest.fn((outer: unknown, inner: unknown) => ({
  kind: 'compose',
  outer,
  inner,
}));
const mockSetUniform = jest.fn();

jest.mock('@shopify/react-native-skia', () => ({
  Skia: {
    Paint: jest.fn(() => ({
      setImageFilter: mockSetImageFilter,
      dispose: jest.fn(),
    })),
    ImageFilter: {
      MakeBlur: (
        sigmaX: number,
        sigmaY: number,
        tileMode: unknown,
        input: unknown
      ) => mockMakeBlur(sigmaX, sigmaY, tileMode, input),
      MakeErode: (radiusX: number, radiusY: number, input: unknown) =>
        mockMakeErode(radiusX, radiusY, input),
      MakeRuntimeShader: (builder: unknown, childShaderName: unknown, input: unknown) =>
        mockMakeRuntimeShader(builder, childShaderName, input),
      MakeColorFilter: (colorFilter: unknown, imageFilter: unknown) =>
        mockMakeColorFilterImageFilter(colorFilter, imageFilter),
    },
    ColorFilter: {
      MakeMatrix: (matrix: number[]) => mockMakeMatrix(matrix),
      MakeCompose: (outer: unknown, inner: unknown) => mockMakeCompose(outer, inner),
    },
    RuntimeShaderBuilder: jest.fn(() => ({
      setUniform: mockSetUniform,
    })),
    RuntimeEffect: {
      Make: jest.fn(() => ({})),
    },
  },
  TileMode: {
    Clamp: 'clamp',
  },
}));

jest.mock('@features/Lens/Obskura/pipeline/matrices/buildTameRedSaturationColorMatrix', () => ({
  buildTameRedSaturationColorMatrix: jest.fn(() => [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0]),
}));

jest.mock('@features/Lens/Obskura/pipeline/matrices/buildUniformSaturationColorMatrix', () => ({
  buildUniformSaturationColorMatrix: jest.fn(() => [2, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 1, 0]),
}));

const mockBuildTameRedSaturationColorMatrix = buildTameRedSaturationColorMatrix as jest.MockedFunction<
  typeof buildTameRedSaturationColorMatrix
>;
const mockBuildUniformSaturationColorMatrix = buildUniformSaturationColorMatrix as jest.MockedFunction<
  typeof buildUniformSaturationColorMatrix
>;

describe('buildObskuraLensPaintFromPipeline', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns paint with no image filter when pipeline is empty', () => {
    buildObskuraLensPaintFromPipeline([], { colorMode: OBSKURA_COLOR_MODE.DEFAULT });

    expect(mockSetImageFilter).not.toHaveBeenCalled();
  });

  it('builds full pipeline with composed image and color filters', () => {
    buildObskuraLensPaintFromPipeline(OBSKURA_LENS_PIPELINE, {
      colorMode: OBSKURA_COLOR_MODE.DEFAULT,
    });

    expect(mockMakeBlur).toHaveBeenCalledWith(60, 60, 'clamp', null);
    expect(mockMakeRuntimeShader).toHaveBeenCalled();
    expect(mockMakeMatrix).toHaveBeenCalled();
    expect(mockMakeCompose).toHaveBeenCalled();
    expect(mockMakeColorFilterImageFilter).toHaveBeenCalled();
    expect(mockSetImageFilter).toHaveBeenCalledTimes(1);
  });

  it('scales blur sigma when outputShortSidePx is provided', () => {
    buildObskuraLensPaintFromPipeline(OBSKURA_LENS_PIPELINE, {
      colorMode: OBSKURA_COLOR_MODE.DEFAULT,
      outputShortSidePx: 2160,
    });

    expect(mockMakeBlur).toHaveBeenCalledWith(120, 120, 'clamp', null);
  });

  it('uses tame-red saturation matrix when colorMode is TAME_RED', () => {
    buildObskuraLensPaintFromPipeline(OBSKURA_LENS_PIPELINE, {
      colorMode: OBSKURA_COLOR_MODE.TAME_RED,
    });

    expect(mockBuildTameRedSaturationColorMatrix).toHaveBeenCalledWith(6);
    expect(mockBuildUniformSaturationColorMatrix).not.toHaveBeenCalled();
  });

  it('uses uniform saturation matrix when colorMode is DEFAULT', () => {
    buildObskuraLensPaintFromPipeline(OBSKURA_LENS_PIPELINE, {
      colorMode: OBSKURA_COLOR_MODE.DEFAULT,
    });

    expect(mockBuildUniformSaturationColorMatrix).toHaveBeenCalledWith(6);
    expect(mockBuildTameRedSaturationColorMatrix).not.toHaveBeenCalled();
  });
});
