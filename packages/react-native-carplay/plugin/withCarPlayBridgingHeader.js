const { withDangerousMod } = require("@expo/config-plugins");
const fs = require("fs").promises;
const path = require("path");

const importsToAdd = [
  '#import "RNCarPlay.h"',
];

/**
 * Adds RNCarPlay.h import to the bridging header for Swift interoperability
 */
const withCarPlayBridgingHeader = (config, options) => {
  return withDangerousMod(config, [
    "ios",
    async c => {
      try {
        const projectRoot = c.modRequest.projectRoot;
        const projectName = c.modRequest.projectName;
        const iosDir = path.join(projectRoot, "ios");

        // Try to find the bridging header in multiple locations
        let headerPath = null;
        let headerFile = null;

        // First check in the ios directory
        const iosFiles = await fs.readdir(iosDir);
        headerFile = iosFiles.find(f => f.endsWith("-Bridging-Header.h"));

        if (headerFile) {
          headerPath = path.join(iosDir, headerFile);
        } else {
          // If not found, check in the project directory
          const projectDir = path.join(iosDir, projectName);

          try {
            const projectFiles = await fs.readdir(projectDir);
            headerFile = projectFiles.find(f => f.endsWith("-Bridging-Header.h"));

            if (headerFile) {
              headerPath = path.join(projectDir, headerFile);
            }
          } catch (e) {
            console.warn(`[CarPlay Plugin] Note: Could not search in project directory: ${e.message}`);
          }
        }

        // If we couldn't find the bridging header, create one
        if (!headerPath) {
          headerFile = `${projectName}-Bridging-Header.h`;
          headerPath = path.join(iosDir, headerFile);
          await fs.writeFile(headerPath, '');
          console.log(`[CarPlay Plugin] Created bridging header: ${headerFile}`);
        }

        // Read the existing content
        let header = await fs.readFile(headerPath, "utf8");

        // Add the required imports
        let importsAdded = false;
        importsToAdd.forEach(line => {
          if (!header.includes(line)) {
            header = line + "\n" + header;
            importsAdded = true;
          }
        });

        if (importsAdded) {
          await fs.writeFile(headerPath, header);
          console.log(`[CarPlay Plugin] Updated bridging header with RNCarPlay import`);
        }

        return c;
      } catch (error) {
        console.error(`[CarPlay Plugin] Error in withBridgingHeader: ${error.message}`);
        return c;
      }
    },
  ]);
};

module.exports = withCarPlayBridgingHeader;
