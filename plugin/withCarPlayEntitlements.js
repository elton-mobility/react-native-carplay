const { withEntitlementsPlist } = require("expo/config-plugins");

/**
 * Map of app types to their CarPlay entitlement keys
 */
const ENTITLEMENT_MAP = {
  'maps': 'com.apple.developer.carplay-maps',
  'audio': 'com.apple.developer.carplay-audio',
  'communication': 'com.apple.developer.carplay-communication',
  'charging': 'com.apple.developer.carplay-charging',
  'parking': 'com.apple.developer.carplay-parking',
  'quick-ordering': 'com.apple.developer.carplay-quick-ordering',
};

/**
 * Adds the appropriate CarPlay entitlement based on app type
 */
const withCarPlayEntitlements = (config, options) => {
  return withEntitlementsPlist(config, c => {
    const appType = options.appType || 'maps';
    const entitlementKey = ENTITLEMENT_MAP[appType];

    if (!entitlementKey) {
      console.warn(`[CarPlay Plugin] Unknown app type: ${appType}. Using 'maps' as default.`);
      c.modResults["com.apple.developer.carplay-maps"] = true;
    } else {
      c.modResults[entitlementKey] = true;
    }

    return c;
  });
};

module.exports = withCarPlayEntitlements;
