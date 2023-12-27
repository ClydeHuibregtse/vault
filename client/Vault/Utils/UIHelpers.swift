//
//  UIHelpers.swift
//  Vault
//
//  Created by Clyde Huibregtse on 9/4/23.
//

import Foundation
import SwiftUI

let PLUS_ICON = "\u{002B}"
let DOWNLOAD_ICON = "\u{2913}"
let UPLOAD_ICON = "\u{2912}"
let X_ICON = "\u{2716}"

func makeButton(title: String, callback: @escaping () -> Void) -> some View {

    return Button(action: {
        print("Button Clicked: \(title)")
        callback()
    }) {
        Text(title)
            .font(.headline)
            .fontWeight(Font.Weight.bold)
    }
        .foregroundColor(.white)
        .cornerRadius(5)
        .padding(3)
}
