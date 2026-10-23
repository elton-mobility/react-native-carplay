import UIKit
import React
internal import Expo

class PhoneSceneDelegate: ExpoAppSceneDelegate {
  override func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
    guard let appDelegate = UIApplication.shared.delegate as? AppDelegate,
          appDelegate.window?.rootViewController != nil,
          let phoneScene = scene as? UIWindowScene else {
      super.scene(scene, willConnectTo: session, options: connectionOptions)
      return
    }

    let window = UIWindow(windowScene: phoneScene)
    let root = appDelegate.window?.rootViewController
    appDelegate.window?.rootViewController = nil
    window.rootViewController = root
    self.window = window
    appDelegate.window = window
    window.makeKeyAndVisible()

    self.scene(scene, openURLContexts: connectionOptions.urlContexts)
    connectionOptions.userActivities.forEach { self.scene(scene, continue: $0) }
    if let shortcut = connectionOptions.shortcutItem {
      self.windowScene(phoneScene, performActionFor: shortcut) { _ in }
    }
  }
}

extension AppDelegate {
  func startReactNativeWithoutScene(launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil) {
    guard window?.rootViewController == nil, let factory = reactNativeFactory else { return }
    let holder = UIWindow(frame: UIScreen.main.bounds)
    window = holder
    factory.startReactNative(
      withModuleName: reactNativeFactoryModuleName,
      in: holder,
      launchOptions: launchOptions
    )
  }
}
