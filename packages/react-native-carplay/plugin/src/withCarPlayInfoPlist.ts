import { ConfigPlugin, withInfoPlist } from "@expo/config-plugins";

export const withCarPlayInfoPlist: ConfigPlugin = (config) => {
  return withInfoPlist(config, (config) => {
    config.modResults.UIApplicationSceneManifest = {
      UIApplicationSupportsMultipleScenes: true,
      UISceneConfigurations: {
        CPTemplateApplicationSceneSessionRoleApplication: [
          {
            UISceneClassName: "CPTemplateApplicationScene",
            UISceneConfigurationName: "CarPlay",
            UISceneDelegateClassName: "$(PRODUCT_MODULE_NAME).CarSceneDelegate",
          },
        ],
        UIWindowSceneSessionRoleApplication: [
          {
            UISceneClassName: "UIWindowScene",
            UISceneConfigurationName: "Phone",
            UISceneDelegateClassName: "$(PRODUCT_MODULE_NAME).PhoneSceneDelegate",
          },
        ],
      },
    };

    return config;
  });
};
