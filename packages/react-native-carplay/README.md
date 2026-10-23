# React Native CarPlay

CarPlay and Android Auto support for React Native applications.

## Features

- 📱 **CarPlay Support**: Full iOS CarPlay integration
- 🚗 **Android Auto Support**: Complete Android Auto compatibility  
- 🎯 **Expo Config Plugin**: SDK 58 scene startup, with the legacy AppDelegate startup path retained
- 🏗️ **New Architecture Ready**: Supports React Native's New Architecture
- 📍 **Navigation Templates**: Map, List, Grid, and more
- 🎵 **Media Support**: Now Playing templates and audio controls
- 📞 **Communication**: Contact and messaging templates

## Installation

```bash
npm install @elton-mobility/react-native-carplay
# or
yarn add @elton-mobility/react-native-carplay
```

## Expo scene startup

The config plugin selects scene templates from the generated AppDelegate, not the device's iOS version:

- **SDK 58:** `ExpoReactNativeFactoryProvider` identifies Expo's scene-owned startup. AppDelegate
  prepares the factory once; `PhoneSceneDelegate` inherits Expo's lifecycle and link forwarding.
- **Phone first:** Expo creates the phone window and starts React Native.
- **CarPlay or background first:** `startReactNativeWithoutScene()` starts React Native in a retained
  holder window. Connecting the phone later moves the existing root controller into its scene window.
- **Phone reconnection:** reuse the root controller instead of mounting another `main` tree.
- **Legacy Expo templates:** retain AppDelegate-owned window creation and `initRN()` startup. The
  SDK 58 scene delegate is not compiled into these apps.

The shared `main` tree is distinct from any map surfaces created for CarPlay templates. Firebase
initialization remains the consuming app's responsibility and must run before React Native starts.

Plugin regression tests use SDK 57 and SDK 58 AppDelegate fixtures:

```bash
yarn workspace @elton-mobility/react-native-carplay test:plugin
```

These tests cover prebuild generation and repeated application of the plugin, not a live CarPlay
connection. Test phone-first, CarPlay-first, background launch and phone reconnection on the target app.

## Requirements

### iOS
- iOS 14.0+
- Xcode 16+
- CarPlay capability in your app

### Android  
- Android API 23+ (Android 6.0)
- Android Auto support
- Automotive App Library 1.7.0

## Setup

### iOS Setup

For Expo, register the plugin and regenerate the native project:

```json
{"expo": {"plugins": ["@elton-mobility/react-native-carplay"]}}
```

```bash
npx expo prebuild --platform ios
```

The plugin installs the phone and CarPlay scene delegates, scene registrations and CarPlay
entitlements. For a bare React Native app, see [CarPlay setup](../../CarPlay.md#installing).

### Android Setup

1. Add Android Auto permissions to your manifest:
   ```xml
   <!-- android/app/src/main/AndroidManifest.xml -->
   <uses-permission android:name="androidx.car.app.NAVIGATION_TEMPLATES" />
   <uses-permission android:name="androidx.car.app.MAP_TEMPLATES" />
   <uses-permission android:name="androidx.car.app.ACCESS_SURFACE" />
   ```

2. Configure your CarPlay service in the manifest.

## Basic Usage

```typescript
import { CarPlay } from '@g4rb4g3/react-native-carplay';

// Initialize CarPlay
CarPlay.connect();

// Create a simple list template
const listTemplate = {
  id: 'main-list',
  title: 'My App',
  sections: [{
    items: [
      { id: '1', text: 'Item 1', detailText: 'Detail 1' },
      { id: '2', text: 'Item 2', detailText: 'Detail 2' },
    ]
  }],
  onItemSelect: (item) => {
    console.log('Selected:', item);
  }
};

// Present the template
CarPlay.presentTemplate(listTemplate);
```

## Templates

### List Template
Perfect for displaying lists of items like music, contacts, or navigation destinations.

### Map Template  
Ideal for navigation apps with turn-by-turn directions and points of interest.

### Grid Template
Great for displaying visual content like album covers or category icons.

### Now Playing Template
Essential for music and audio apps to show current playback status.

## Troubleshooting

### Android Build Issues

If you encounter build issues after upgrading to Expo SDK 53:

1. **Clean your build cache**:
   ```bash
   cd android && ./gradlew clean
   ```

2. **Update your project's Gradle version** in `android/gradle/wrapper/gradle-wrapper.properties`:
   ```properties
   distributionUrl=https\://services.gradle.org/distributions/gradle-8.14.1-bin.zip
   ```

3. **Ensure correct SDK versions** in your `android/build.gradle`:
   ```gradle
   compileSdkVersion 34
   targetSdkVersion 34
   minSdkVersion 23
   ```

4. **Update Kotlin version** in your project's `android/build.gradle`:
   ```gradle
   ext.kotlinVersion = '1.9.25'
   ```

### Common Issues

- **"Module not found"**: Make sure you've run `pod install` (iOS) or rebuilt your project (Android)
- **CarPlay not connecting**: Ensure your app has the CarPlay capability and proper entitlements
- **Android Auto not working**: Check that all required permissions are added to your manifest

## Migration from Previous Versions

If upgrading from an older version:

1. Update your dependencies to match Expo SDK 53
2. Rebuild your development build 
3. Test all CarPlay/Android Auto functionality
4. Update any deprecated API usage

## Creating a New Release

This fork is used by the Elton app via a GitHub release tarball. To create a new release:

1. **Make your changes** and commit them to master

2. **Update the version** in `package.json`

3. **Build the package**:
   ```bash
   cd packages/react-native-carplay
   yarn build && yarn build:plugin
   ```

4. **Create the tarball**:
   ```bash
   npm pack
   ```

5. **Create a GitHub release** with the tarball:
   ```bash
   gh release create v1.x.x --title "v1.x.x - Description" \
     --notes "Release notes here" \
     elton-mobility-react-native-carplay-1.x.x.tgz
   ```

6. **Update the Elton app** `package.json` to reference the new release URL

## Contributing

We welcome contributions! Please read our contributing guidelines and submit pull requests to the main repository.

## License

MIT License - see LICENSE file for details.

## Support

- 📚 [Documentation](https://github.com/g4rb4g3/react-native-carplay/wiki)
- 🐛 [Issue Tracker](https://github.com/g4rb4g3/react-native-carplay/issues)
- 💬 [Discussions](https://github.com/g4rb4g3/react-native-carplay/discussions)

---

Made with ❤️ for the React Native community 