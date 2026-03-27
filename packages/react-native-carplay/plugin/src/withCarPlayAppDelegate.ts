import { ConfigPlugin, withAppDelegate } from "@expo/config-plugins";

/**
 * CarPlay AppDelegate Configuration Plugin
 *
 * This plugin modifies the iOS AppDelegate.swift file to support CarPlay functionality.
 * It performs the following transformations:
 * 1. Adds necessary imports
 * 2. Updates class definition and adds state variables
 * 3. Restructures the main application method
 * 4. Adds React Native initialization function
 * 5. Adds CarPlay scene configuration methods
 */
export const withCarPlayAppDelegate: ConfigPlugin = (config) => {
  return withAppDelegate(config, (config) => {
    let contents = config.modResults.contents;

    // Apply all transformations in logical order
    contents = addRequiredImports(contents);
    contents = updateClassDefinition(contents);
    contents = updateReactNativeDelegateType(contents);
    contents = addObjcToReactNativeFactory(contents);
    contents = removeExistingCarPlayMethods(contents);
    contents = addReactNativeInitFunction(contents);
    contents = restructureApplicationMethod(contents);
    contents = addCarPlaySceneMethods(contents);

    config.modResults.contents = contents;
    return config;
  });
};

/**
 * Adds required imports to the top of the file if they don't already exist
 */
function addRequiredImports(contents: string): string {
  const requiredImports = ["import CarPlay", "import UIKit", "import Expo"];

  requiredImports.forEach((importStatement) => {
    if (!contents.includes(importStatement)) {
      contents = importStatement + "\n" + contents;
    }
  });

  return contents;
}

/**
 * Updates the class definition from @UIApplicationMain to @main
 * and adds the initialized state variable
 */
function updateClassDefinition(contents: string): string {
  // Update @UIApplicationMain to @main
  const uiAppMainPattern = /@UIApplicationMain\s*public class AppDelegate:/;

  if (contents.match(uiAppMainPattern)) {
    contents = contents.replace(uiAppMainPattern, "@main\nclass AppDelegate:");
  }
  // If @UIApplicationMain is not found, it's expected for Expo 55+ which already uses @main

  // Add initialized state variable if missing
  if (!contents.includes("var initialized: Bool = false")) {
    const classPattern = /class AppDelegate:.*\{/;
    const classMatch = contents.match(classPattern);

    if (classMatch) {
      contents = contents.replace(classPattern, (match) => `${match}\n  var initialized: Bool = false`);
    } else {
      throw new Error("[CarPlay Plugin] Could not find AppDelegate class definition to add initialized variable");
    }
  }

  return contents;
}

/**
 * Updates the reactNativeDelegate type from ExpoReactNativeFactoryDelegate to ReactNativeDelegate
 */
function updateReactNativeDelegateType(contents: string): string {
  const oldDelegatePattern = /var\s+reactNativeDelegate:\s+ExpoReactNativeFactoryDelegate\?/;

  if (contents.includes("var reactNativeDelegate: ExpoReactNativeFactoryDelegate?")) {
    contents = contents.replace(oldDelegatePattern, "var reactNativeDelegate: ReactNativeDelegate?");
  } else {
    console.warn("[CarPlay Plugin] Could not find ExpoReactNativeFactoryDelegate to update type");
  }

  return contents;
}

/**
 * Adds @objc attribute to reactNativeFactory property so it can be accessed from Objective-C
 * This is required for react-native-carplay to detect New Architecture support
 */
function addObjcToReactNativeFactory(contents: string): string {
  // Match "var reactNativeFactory:" that is NOT already preceded by @objc
  const factoryPattern = /(?<!@objc\s+)var\s+reactNativeFactory:\s*RCTReactNativeFactory\?/;

  if (contents.match(factoryPattern)) {
    contents = contents.replace(factoryPattern, "@objc var reactNativeFactory: RCTReactNativeFactory?");
    console.log("[CarPlay Plugin] Added @objc to reactNativeFactory property");
  } else if (contents.includes("@objc var reactNativeFactory:")) {
    console.log("[CarPlay Plugin] reactNativeFactory already has @objc attribute");
  } else {
    console.warn("[CarPlay Plugin] Could not find reactNativeFactory property to add @objc");
  }

  return contents;
}

/**
 * Restructures the main application method to use our custom initRN function
 */
function restructureApplicationMethod(contents: string): string {
  const appDelegatePattern =
    /public\s+override\s+func\s+application\s*\([^{]*\)\s*->\s*Bool\s*\{[\s\S]*?return[^}]*\}/;

  if (contents.match(appDelegatePattern)) {
    const newApplicationMethod = `public override func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil) -> Bool {

    initRN(launchOptions: launchOptions)

    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
  }`;

    contents = contents.replace(appDelegatePattern, newApplicationMethod);
  } else {
    throw new Error("[CarPlay Plugin] Could not find application didFinishLaunchingWithOptions method to restructure");
  }

  return contents;
}

/**
 * Removes any existing CarPlay configuration methods to prevent duplication
 */
function removeExistingCarPlayMethods(contents: string): string {
  const carPlayMethodsPattern =
    /\/\/\s*@generated begin carplay-applicationConfigForConnecting[\s\S]*?\/\/\s*@generated end carplay-applicationConfigForConnecting/;

  if (contents.match(carPlayMethodsPattern)) {
    contents = contents.replace(carPlayMethodsPattern, "");
    console.warn("[CarPlay Plugin] Removed existing CarPlay configuration methods to prevent duplication");
  }

  return contents;
}

/**
 * Extracts the body of didFinishLaunchingWithOptions and wraps it in an initRN function.
 * Must be called BEFORE restructureApplicationMethod, while the original body is intact.
 */
function addReactNativeInitFunction(contents: string): string {
  if (contents.includes("func initRN(")) {
    return contents; // Already exists
  }

  // Find the didFinishLaunchingWithOptions method signature
  const methodSignaturePattern =
    /public\s+override\s+func\s+application\s*\(\s*_\s+application:\s*UIApplication\s*,\s*didFinishLaunchingWithOptions\s+launchOptions:[^)]*\)\s*->\s*Bool\s*\{/;

  const signatureMatch = contents.match(methodSignaturePattern);
  if (!signatureMatch || signatureMatch.index === undefined) {
    throw new Error(
      "[CarPlay Plugin] Could not find application didFinishLaunchingWithOptions method to extract body for initRN"
    );
  }

  // Find the method body by brace-matching from the opening {
  const methodStartIndex = signatureMatch.index + signatureMatch[0].length;
  let braceDepth = 1;
  let methodEndIndex = methodStartIndex;

  for (let i = methodStartIndex; i < contents.length; i++) {
    if (contents[i] === "{") {
      braceDepth++;
    } else if (contents[i] === "}") {
      braceDepth--;
      if (braceDepth === 0) {
        methodEndIndex = i;
        break;
      }
    }
  }

  if (braceDepth !== 0) {
    throw new Error(
      "[CarPlay Plugin] Could not find matching closing brace for didFinishLaunchingWithOptions"
    );
  }

  // Extract the body (between opening { and closing })
  const methodBody = contents.substring(methodStartIndex, methodEndIndex);

  // Remove the `return super.application(...)` line — it stays in the restructured method
  const returnPattern =
    /\n?\s*return\s+super\.application\s*\(\s*application\s*,\s*didFinishLaunchingWithOptions\s*:\s*launchOptions\s*\)\s*\n?/;
  let initBody = methodBody.replace(returnPattern, "");

  // Trim leading/trailing blank lines but preserve internal structure
  initBody = initBody.replace(/^\n+/, "").replace(/\n+$/, "");

  const initRNFunction = `  func initRN(launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil) {
    if (initialized) { return }
    initialized = true
${initBody}
  }`;

  // Insert right after the closing } of didFinishLaunchingWithOptions
  const insertPosition = methodEndIndex + 1;
  contents =
    contents.substring(0, insertPosition) +
    "\n\n" +
    initRNFunction +
    contents.substring(insertPosition);

  return contents;
}

/**
 * Adds CarPlay scene configuration methods for handling CarPlay and Phone scenes
 */
function addCarPlaySceneMethods(contents: string): string {
  const carPlayMethods = `  func application(_ application: UIApplication, configurationForConnecting connectingSceneSession: UISceneSession, options: UIScene.ConnectionOptions) -> UISceneConfiguration {
    if (connectingSceneSession.role == UISceneSession.Role.carTemplateApplication) {
      let scene =  UISceneConfiguration(name: "CarPlay", sessionRole: connectingSceneSession.role)
      scene.delegateClass = CarSceneDelegate.self
      return scene
    } else {
      let scene =  UISceneConfiguration(name: "Phone", sessionRole: connectingSceneSession.role)
      scene.delegateClass = PhoneSceneDelegate.self
      return scene
    }
  }

  func application(_ application: UIApplication, didDiscardSceneSessions sceneSessions: Set<UISceneSession>) {
  }`;

  // Try to add after Universal Links section
  const universalLinksPattern =
    /\/\/\s*Universal Links[\s\S]*?restorationHandler:[^}]*\}\s*\)\s*(?:\|\|\s*result)?\s*\n  \}/;

  if (contents.match(universalLinksPattern)) {
    contents = contents.replace(universalLinksPattern, (match) => `${match}\n\n${carPlayMethods}`);
  } else {
    // Fallback: add before ReactNativeDelegate class
    const classEndPattern = /\}\s*\n\s*class\s+ReactNativeDelegate/;

    if (contents.match(classEndPattern)) {
      contents = contents.replace(classEndPattern, `\n\n${carPlayMethods}\n}\n\nclass ReactNativeDelegate`);
    } else {
      // Last resort: add before final closing brace
      const lastBracePattern = /\n\}\s*$/;

      if (contents.match(lastBracePattern)) {
        contents = contents.replace(lastBracePattern, `\n\n${carPlayMethods}\n}`);
      } else {
        throw new Error("[CarPlay Plugin] Could not find suitable location to add CarPlay scene methods");
      }
    }
  }

  return contents;
}
