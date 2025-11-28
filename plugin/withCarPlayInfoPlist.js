const { withInfoPlist } = require("@expo/config-plugins");

/**
 * Configures Info.plist with CarPlay scene manifest
 */
const withCarPlayInfoPlist = (config, options) => {
  return withInfoPlist(config, config => {
    config.modResults.UIApplicationSceneManifest = {
      UIApplicationSupportsMultipleScenes: true,
      UISceneConfigurations: {
        CPTemplateApplicationSceneSessionRoleApplication: [
          {
            UISceneClassName: "CPTemplateApplicationScene",
            UISceneConfigurationName: "CarPlay",
            UISceneDelegateClassName: '$(PRODUCT_MODULE_NAME).CarSceneDelegate',
          },
        ],
        UIWindowSceneSessionRoleApplication: [
          {
            UISceneClassName: "UIWindowScene",
            UISceneConfigurationName: "Phone",
            UISceneDelegateClassName: '$(PRODUCT_MODULE_NAME).PhoneSceneDelegate',
          },
        ],
      },
    };

    return config;
  });
};

module.exports = withCarPlayInfoPlist;
