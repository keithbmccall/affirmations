module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      'babel-preset-expo',
      {
        jsxImportSource: '@welldone-software/why-did-you-render',
      },
    ],
    plugins: [
      ['react-native-worklets-core/plugin'],
      ['react-native-reanimated/plugin'], // ← this MUST be last
    ],
  };
};
