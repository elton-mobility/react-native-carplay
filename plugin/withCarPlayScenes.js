const { withXcodeProject, withDangerousMod, IOSConfig } = require("@expo/config-plugins");
const path = require("path");
const { promises: fs } = require("fs");

/**
 * Adds a source file to the Xcode project
 */
const addSourceFileToProject = (proj, file, projectName) => {
  const targetUuid = proj.findTargetKey(projectName);
  const groupUuid = proj.findPBXGroupKey({ name: projectName });

  if (!targetUuid) {
    console.error(`[CarPlay Plugin] Failed to find "${projectName}" target!`);
    return;
  }
  if (!groupUuid) {
    console.error(`[CarPlay Plugin] Failed to find "${projectName}" group!`);
    return;
  }

  proj.addSourceFile(
    file,
    { target: targetUuid },
    groupUuid,
  );
};

/**
 * Copies a file from templates to the iOS project
 */
async function copyFile(templatesDir, destDir, fileName) {
  const sourcePath = path.join(templatesDir, fileName);
  const destPath = path.join(destDir, fileName);

  try {
    await fs.access(sourcePath);
    try {
      await fs.copyFile(sourcePath, destPath);
      console.log(`[CarPlay Plugin] Copied ${fileName}`);
    } catch (e) {
      console.error(`[CarPlay Plugin] Failed to copy ${fileName}:`, e);
    }
  } catch (e) {
    console.error(`[CarPlay Plugin] Source ${fileName} doesn't exist at ${sourcePath}`);
  }
}

/**
 * Copies scene delegate Swift files to the iOS project
 */
const withCarPlayScenesFiles = (config, options) => {
  return withDangerousMod(config, [
    "ios",
    async c => {
      const projectPath = IOSConfig.Paths.getAppDelegateFilePath(c.modRequest.projectRoot);
      const targetDir = path.dirname(projectPath);
      const templatesDir = path.join(__dirname, "templates");

      await copyFile(templatesDir, targetDir, "CarSceneDelegate.swift");
      await copyFile(templatesDir, targetDir, "PhoneSceneDelegate.swift");

      return c;
    },
  ]);
};

/**
 * Adds the scene delegate files to the Xcode project
 */
const withCarPlayScenesInProject = (config, options) => {
  return withXcodeProject(config, async c => {
    // Get the project name dynamically
    const projectName = c.modRequest.projectName;

    addSourceFileToProject(c.modResults, `${projectName}/CarSceneDelegate.swift`, projectName);
    addSourceFileToProject(c.modResults, `${projectName}/PhoneSceneDelegate.swift`, projectName);

    return c;
  });
};

module.exports = { withCarPlayScenesFiles, withCarPlayScenesInProject };
