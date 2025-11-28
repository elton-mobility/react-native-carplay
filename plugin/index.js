const withCarPlayInfoPlist = require("./withCarPlayInfoPlist");
const withCarPlayEntitlements = require("./withCarPlayEntitlements");
const { withCarPlayScenesFiles, withCarPlayScenesInProject } = require("./withCarPlayScenes");
const withCarPlayAppDelegate = require("./withCarPlayAppDelegate");
const withCarPlayBridgingHeader = require("./withCarPlayBridgingHeader");

/**
 * Expo config plugin for react-native-carplay
 *
 * @param {import('@expo/config-plugins').ExpoConfig} config
 * @param {Object} props - Plugin options
 * @param {string} [props.appType='maps'] - CarPlay app type: 'maps', 'audio', 'communication', 'charging', 'parking', 'quick-ordering'
 * @returns {import('@expo/config-plugins').ExpoConfig}
 */
const withCarPlay = (config, props = {}) => {
  const options = {
    appType: 'maps',
    ...props
  };

  config = withCarPlayInfoPlist(config, options);
  config = withCarPlayEntitlements(config, options);
  config = withCarPlayScenesFiles(config, options);
  config = withCarPlayScenesInProject(config, options);
  config = withCarPlayAppDelegate(config, options);
  config = withCarPlayBridgingHeader(config, options);

  return config;
};

module.exports = withCarPlay;
