module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'], // or metro preset if not Expo
    plugins: [
      ['react-native-worklets-core/plugin'],
      ['react-native-reanimated/plugin'], // ← this MUST be last
    ],
  };
};
