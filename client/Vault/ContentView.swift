//
//  ContentView.swift
//  Vault
//
//  Created by Clyde Huibregtse on 8/21/23.
//
import Foundation
import SwiftUI



struct ContentView: View {
    let txViewModel = TransactionsViewModel()
    var body: some View {
        TransactionView(viewModel: txViewModel)
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}
