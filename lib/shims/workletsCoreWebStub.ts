/**
 * Web stub for `react-native-worklets-core`.
 * The real package imports `TurboModuleRegistry` from `react-native`; on web,
 * Metro resolves `react-native` to `react-native-web`, which does not define
 * `TurboModuleRegistry`, so loading the native module throws before any JS API
 * exists. Metro resolves the package to this file for `platform === 'web'`
 * only (see metro.config.js).
 */
export const Worklets = {
  createRunOnJS<TArgs extends unknown[], TReturn>(
    func: (...args: TArgs) => TReturn
  ): (...args: TArgs) => Promise<TReturn> {
    return (...args: TArgs) => Promise.resolve(func(...args));
  },
};
