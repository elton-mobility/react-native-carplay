import { ConfigPlugin } from "@expo/config-plugins";
import { withCarPlayInfoPlist } from "./withCarPlayInfoPlist";
import { withCarPlayEntitlements } from "./withCarPlayEntitlements";
import { withCarPlayScenesFiles, withCarPlayScenesInProject } from "./withCarPlayScenes";
import { withCarPlayAppDelegate } from "./withCarPlayAppDelegate";
import { withCarPlayBridgingHeader } from "./withCarPlayBridgingHeader";

export interface CarPlayPluginProps {
  /**
   * The name of the Xcode project/target (defaults to project name from config)
   */
  xcodeProjectName?: string;
}

const withCarPlay: ConfigPlugin<CarPlayPluginProps | void> = (config, props) => {
  const xcodeProjectName = props?.xcodeProjectName ?? config.name;

  config = withCarPlayInfoPlist(config);
  config = withCarPlayEntitlements(config);
  config = withCarPlayScenesFiles(config);
  config = withCarPlayScenesInProject(config, { xcodeProjectName });
  config = withCarPlayAppDelegate(config);
  config = withCarPlayBridgingHeader(config, { xcodeProjectName });

  return config;
};

export default withCarPlay;
