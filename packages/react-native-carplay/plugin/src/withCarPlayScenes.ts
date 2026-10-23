import { ConfigPlugin, withXcodeProject, withDangerousMod, IOSConfig } from "@expo/config-plugins";
import * as path from "path";
import * as fs from "fs";
import { usesExpoSceneStartup } from "./withCarPlayAppDelegate";

export const withCarPlayScenesFiles: ConfigPlugin = (config) => {
  return withDangerousMod(config, [
    "ios",
    async (config) => {
      const projectPath = IOSConfig.Paths.getAppDelegateFilePath(config.modRequest.projectRoot);
      const targetDir = path.dirname(projectPath);
      const appDelegate = await fs.promises.readFile(projectPath, "utf8");
      const templatesDir = path.join(__dirname, "..", "templates");
      const suffix = usesExpoSceneStartup(appDelegate) ? ".expo58" : "";

      await Promise.all(["CarSceneDelegate", "PhoneSceneDelegate"].map(scene =>
        fs.promises.copyFile(
          path.join(templatesDir, `${scene}${suffix}.swift`),
          path.join(targetDir, `${scene}.swift`)
        )
      ));

      return config;
    },
  ]);
};

interface WithCarPlayScenesInProjectProps {
  xcodeProjectName: string;
}

export const withCarPlayScenesInProject: ConfigPlugin<WithCarPlayScenesInProjectProps> = (
  config,
  { xcodeProjectName }
) => {
  return withXcodeProject(config, async (config) => {
    const proj = config.modResults;

    const addSourceFileToProject = (file: string) => {
      const targetUuid = proj.findTargetKey(xcodeProjectName);
      const groupUuid = proj.findPBXGroupKey({ name: xcodeProjectName });

      if (!targetUuid) {
        console.error(`[withCarPlay] Failed to find "${xcodeProjectName}" target!`);
        return;
      }
      if (!groupUuid) {
        console.error(`[withCarPlay] Failed to find "${xcodeProjectName}" group!`);
        return;
      }

      proj.addSourceFile(file, { target: targetUuid }, groupUuid);
    };

    addSourceFileToProject(`${xcodeProjectName}/CarSceneDelegate.swift`);
    addSourceFileToProject(`${xcodeProjectName}/PhoneSceneDelegate.swift`);

    return config;
  });
};
