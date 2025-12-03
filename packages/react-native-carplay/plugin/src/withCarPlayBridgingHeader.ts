import { ConfigPlugin, withDangerousMod } from "@expo/config-plugins";
import * as fs from "fs";
import * as path from "path";

const importsToAdd = ['#import "RNCarPlay.h"'];

interface WithCarPlayBridgingHeaderProps {
  xcodeProjectName: string;
}

export const withCarPlayBridgingHeader: ConfigPlugin<WithCarPlayBridgingHeaderProps> = (
  config,
  { xcodeProjectName }
) => {
  return withDangerousMod(config, [
    "ios",
    async (config) => {
      try {
        const projectRoot = config.modRequest.projectRoot;
        const iosDir = path.join(projectRoot, "ios");

        // Try to find the bridging header in multiple locations
        let headerPath: string | null = null;
        let headerFile: string | undefined;

        // First check in the ios directory
        const iosFiles = await fs.promises.readdir(iosDir);
        headerFile = iosFiles.find((f) => f.endsWith("-Bridging-Header.h"));

        if (headerFile) {
          headerPath = path.join(iosDir, headerFile);
        } else {
          // If not found, check in the project directory
          const projectDir = path.join(iosDir, xcodeProjectName);

          try {
            const projectFiles = await fs.promises.readdir(projectDir);
            headerFile = projectFiles.find((f) => f.endsWith("-Bridging-Header.h"));

            if (headerFile) {
              headerPath = path.join(projectDir, headerFile);
            }
          } catch (e) {
            // It's okay if this fails, we'll create the file later
            console.warn(`[withCarPlay] Note: Could not search in project directory: ${(e as Error).message}`);
          }
        }

        // If we couldn't find the bridging header, create one
        if (!headerPath) {
          headerFile = `${xcodeProjectName}-Bridging-Header.h`;
          headerPath = path.join(iosDir, headerFile);
          await fs.promises.writeFile(headerPath, "");
        }

        // Read the existing content
        let header = await fs.promises.readFile(headerPath, "utf8");

        // Add the required imports
        let importsAdded = false;
        importsToAdd.forEach((line) => {
          if (!header.includes(line)) {
            header = line + "\n" + header;
            importsAdded = true;
          }
        });

        if (importsAdded) {
          // Write the updated content back
          await fs.promises.writeFile(headerPath, header);
        }

        return config;
      } catch (error) {
        console.error(`[withCarPlay] Error in withBridgingHeader: ${(error as Error).message}`);
        return config;
      }
    },
  ]);
};
