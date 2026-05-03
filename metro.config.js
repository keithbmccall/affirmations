const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const projectRoot = __dirname;
const config = getDefaultConfig(projectRoot);

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web' && moduleName === 'react-native-worklets-core') {
    return {
      type: 'sourceFile',
      filePath: path.join(projectRoot, 'lib/shims/workletsCoreWebStub.ts'),
    };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
