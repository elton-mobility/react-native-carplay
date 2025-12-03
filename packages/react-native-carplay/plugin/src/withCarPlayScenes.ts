import { ConfigPlugin, withXcodeProject, withDangerousMod, IOSConfig } from "@expo/config-plugins";
import * as path from "path";
import * as fs from "fs";

async function copyFile(templatesDir: string, destDir: string, fileName: string): Promise<void> {
  const sourcePath = path.join(templatesDir, fileName);
  const destPath = path.join(destDir, fileName);

  try {
    await fs.promises.access(sourcePath);
    try {
      await fs.promises.copyFile(sourcePath, destPath);
    } catch (e) {
      console.error(`[withCarPlay] Failed to copy ${fileName}:`, e);
    }
  } catch (e) {
    console.error(`[withCarPlay] Source ${fileName} doesn't exist at ${sourcePath}`);
  }
}

export const withCarPlayScenesFiles: ConfigPlugin = (config) => {
  return withDangerousMod(config, [
    "ios",
    async (config) => {
      const projectPath = IOSConfig.Paths.getAppDelegateFilePath(config.modRequest.projectRoot);
      const targetDir = path.dirname(projectPath);
      const templatesDir = path.join(__dirname, "..", "templates");

      await copyFile(templatesDir, targetDir, "CarSceneDelegate.swift");
      await copyFile(templatesDir, targetDir, "PhoneSceneDelegate.swift");

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
