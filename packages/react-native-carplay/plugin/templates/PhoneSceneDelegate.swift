import Foundation
import UIKit
import SwiftUI
import React

class PhoneSceneDelegate: UIResponder, UIWindowSceneDelegate {
  var window: UIWindow?
  func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {

    guard let appDelegate = UIApplication.shared.delegate as? AppDelegate else { return }
    appDelegate.initRN(launchOptions: connectionOptions2LaunchOptions(connectionOptions: connectionOptions))

    guard let windowScene = scene as? UIWindowScene else { return }
    guard let appRootView = appDelegate.window?.rootViewController?.view else { return }

    let rootViewController = UIViewController()

    // Fix: Check if rootView is already associated with a view controller
    if appRootView.superview != nil {
      appRootView.removeFromSuperview()
    }

    rootViewController.view.addSubview(appRootView)

    let window = UIWindow(windowScene: windowScene)
    window.rootViewController = rootViewController
    self.window = window
    window.makeKeyAndVisible()
  }

  // Forward custom URL scheme links when app is already running/in foreground
  func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
    guard let url = URLContexts.first?.url else { return }
    _ = RCTLinkingManager.application(UIApplication.shared, open: url, options: [:])
  }

  // Forward universal links (applinks) while using scenes
  func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
    _ = RCTLinkingManager.application(UIApplication.shared, continue: userActivity) { _ in }
  }
}

func connectionOptions2LaunchOptions(connectionOptions: UIScene.ConnectionOptions?) -> [UIApplication.LaunchOptionsKey: Any] {
  var launchOptions: [UIApplication.LaunchOptionsKey: Any] = [:]

  if let options = connectionOptions {
    // Map initial URL (custom scheme) to classic UIApplication launchOptions for RN Linking.getInitialURL()
    if let url = options.urlContexts.first?.url {
      launchOptions[UIApplication.LaunchOptionsKey.url] = url
    }
    if options.notificationResponse != nil {
      launchOptions[UIApplication.LaunchOptionsKey.remoteNotification] = options.notificationResponse?.notification.request.content.userInfo;
    }

    if !options.userActivities.isEmpty {
      let userActivity = options.userActivities.first;
      let userActivityDictionary = [
        "UIApplicationLaunchOptionsUserActivityTypeKey": userActivity?.activityType as Any,
        "UIApplicationLaunchOptionsUserActivityKey": userActivity!
      ] as [String : Any];
      launchOptions[UIApplication.LaunchOptionsKey.userActivityDictionary] = userActivityDictionary;
    }
  }

  return launchOptions
}
