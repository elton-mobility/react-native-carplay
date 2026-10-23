const fs = require('fs/promises');
const os = require('os');
const path = require('path');
const withCarPlay = require('../build').default;

async function appDelegateFor(sdk) {
  return fs.readFile(path.join(__dirname, `fixtures/AppDelegate.sdk${sdk}.swift`), 'utf8');
}

async function transform(contents) {
  const config = withCarPlay({ name: 'Example', slug: 'example' });
  const result = await config.mods.ios.appDelegate({
    ...config,
    modResults: { language: 'swift', contents },
    modRequest: { projectRoot: process.cwd(), platform: 'ios', modName: 'appDelegate' },
  });
  return result.modResults.contents;
}

test('SDK 58 prepares one factory and starts background launches without a phone scene', async () => {
  const contents = await transform(await appDelegateFor(58));
  expect(contents).toContain('ExpoReactNativeFactoryProvider');
  expect(contents.match(/let factory = ExpoReactNativeFactory/g)).toHaveLength(1);
  expect(contents).toContain('if (initialized) { return }');
  expect(contents).toContain('if application.applicationState == .background');
  expect(contents).toContain('startReactNativeWithoutScene(launchOptions: launchOptions)');
  expect(contents).not.toContain('factory.startReactNative(');
  expect(contents).not.toContain('Firebase');
});

test('SDK 57 keeps the existing AppDelegate-owned window and React Native startup', async () => {
  const contents = await transform(await appDelegateFor(57));
  expect(contents).toContain('window = UIWindow(frame: UIScreen.main.bounds)');
  expect(contents.match(/factory.startReactNative\(/g)).toHaveLength(1);
  expect(contents).not.toContain('startReactNativeWithoutScene');
  expect(contents.indexOf('factory.startReactNative(')).toBeGreaterThan(
    contents.indexOf('func initRN('),
  );
  expect(contents).toContain('RCTLinkingManager.application');
});

test.each([57, 58])(
  'SDK %s can be prebuilt again without duplicating startup or scene methods',
  async sdk => {
    const once = await transform(await appDelegateFor(sdk));
    const twice = await transform(once);
    expect(twice.match(/func initRN\(/g)).toHaveLength(1);
    expect(twice.match(/configurationForConnecting connectingSceneSession:/g)).toHaveLength(1);
    expect(twice.match(/didDiscardSceneSessions sceneSessions:/g)).toHaveLength(1);
    expect(twice.match(/let factory = ExpoReactNativeFactory/g)).toHaveLength(1);
  },
);

test.each([57, 58])('SDK %s copies the matching phone and CarPlay scene templates', async sdk => {
  const projectRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'carplay-scenes-'));
  const directory = path.join(projectRoot, 'ios/Example');
  try {
    await fs.mkdir(directory, { recursive: true });
    await fs.writeFile(path.join(directory, 'AppDelegate.swift'), await appDelegateFor(sdk));
    const config = withCarPlay({ name: 'Example', slug: 'example' });
    await config.mods.ios.dangerous({
      ...config,
      modResults: {},
      modRequest: { projectRoot, platform: 'ios', modName: 'dangerous' },
    });
    for (const file of ['PhoneSceneDelegate.swift', 'CarSceneDelegate.swift']) {
      const templateName = sdk === 58 ? file.replace('.swift', '.expo58.swift') : file;
      const template = path.join(__dirname, '../templates', templateName);
      expect(await fs.readFile(path.join(directory, file), 'utf8')).toBe(
        await fs.readFile(template, 'utf8'),
      );
    }
    const phone = await fs.readFile(path.join(directory, 'PhoneSceneDelegate.swift'), 'utf8');
    const car = await fs.readFile(path.join(directory, 'CarSceneDelegate.swift'), 'utf8');
    if (sdk === 58) {
      expect(phone).toContain('class PhoneSceneDelegate: ExpoAppSceneDelegate');
      expect(phone).toContain('appDelegate.window?.rootViewController = nil');
      expect(phone).toContain('appDelegate.window = window');
      expect(phone).toContain('guard window?.rootViewController == nil');
      expect(phone).toContain('openURLContexts: connectionOptions.urlContexts');
      expect(phone).toContain('connectionOptions.userActivities.forEach');
      expect(phone).toContain('connectionOptions.shortcutItem');
      expect(car).toContain('appDelegate.startReactNativeWithoutScene()');
    } else {
      expect(phone).not.toContain('ExpoAppSceneDelegate');
      expect(car).toContain('appDelegate.initRN()');
    }
  } finally {
    await fs.rm(projectRoot, { recursive: true, force: true });
  }
});

test('retains the phone and CarPlay scene registrations', async () => {
  const config = withCarPlay({ name: 'Example', slug: 'example' });
  const result = await config.mods.ios.infoPlist({
    ...config,
    modResults: {},
    modRequest: { projectRoot: process.cwd(), platform: 'ios', modName: 'infoPlist' },
  });
  const roles = result.modResults.UIApplicationSceneManifest.UISceneConfigurations;
  expect(roles.UIWindowSceneSessionRoleApplication[0].UISceneDelegateClassName).toContain(
    'PhoneSceneDelegate',
  );
  expect(
    roles.CPTemplateApplicationSceneSessionRoleApplication[0].UISceneDelegateClassName,
  ).toContain('CarSceneDelegate');
});
