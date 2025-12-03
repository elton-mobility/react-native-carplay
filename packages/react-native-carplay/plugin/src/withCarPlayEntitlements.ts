import { ConfigPlugin, withEntitlementsPlist } from "@expo/config-plugins";

export const withCarPlayEntitlements: ConfigPlugin = (config) => {
  return withEntitlementsPlist(config, (config) => {
    config.modResults["com.apple.developer.carplay-maps"] = true;
    return config;
  });
};
