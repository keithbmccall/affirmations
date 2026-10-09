module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      [
        'babel-preset-expo',
        {
          jsxImportSource: '@welldone-software/why-did-you-render',
        },
      ],
    ],
    plugins: [
      // Reanimated 4 re-exports react-native-worklets/plugin — list only once, last.
      ['react-native-reanimated/plugin'],
    ],
  };
};
