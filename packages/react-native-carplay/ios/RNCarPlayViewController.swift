//
//  RNCarPlayViewController.swift
//  RNCarPlay
//
//  Created by Susan Thapa on 27/02/2024.
//  Updated by Manuel Auer on 24.10.24.
//

import React

@objc(RNCarPlayViewController)
public class RNCarPlayViewController: UIViewController {
    let rootView: UIView
    let moduleName: String
    
    /// New Architecture compatible initializer - accepts any UIView
    @objc public init(rootView: UIView, moduleName: String) {
        self.rootView = rootView
        self.moduleName = moduleName
        super.init(nibName: nil, bundle: nil)
    }

    /// Old Architecture initializer - accepts RCTRootView
    @objc public convenience init(rootView: RCTRootView) {
        self.init(rootView: rootView as UIView, moduleName: rootView.moduleName ?? "")
    }

    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    public override func viewDidLoad() {
        super.viewDidLoad()

        // Add rootView as a subview with proper constraints
        rootView.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(rootView)

        NSLayoutConstraint.activate([
            rootView.topAnchor.constraint(equalTo: view.topAnchor),
            rootView.bottomAnchor.constraint(equalTo: view.bottomAnchor),
            rootView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            rootView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
        ])
    }

    public override func viewWillLayoutSubviews() {
        super.viewWillLayoutSubviews()
        // Layout is handled by constraints now
    }

    public override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()

        RNCarPlayUtils.sendRNCarPlayEvent(
            name: "safeAreaInsetsDidChange",
            body: [
                "bottom": self.view.safeAreaInsets.bottom,
                "left": self.view.safeAreaInsets.left,
                "right": self.view.safeAreaInsets.right,
                "top": self.view.safeAreaInsets.top,
                "id": self.moduleName,
            ])
    }

    public override func traitCollectionDidChange(
        _ previousTraitCollection: UITraitCollection?
    ) {
        super.traitCollectionDidChange(previousTraitCollection)
        if traitCollection.hasDifferentColorAppearance(
            comparedTo: previousTraitCollection)
        {
            RNCarPlayUtils.sendRNCarPlayEvent(
                name: "appearanceDidChange",
                body: [
                    "colorScheme": traitCollection.userInterfaceStyle == .dark
                        ? "dark" : "light",
                    "id": self.moduleName,
                ])
        }
    }
    
    deinit {
        rootView.removeFromSuperview()
    }
}
