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
    let stmtViewModel = StatementsViewModel()

    var body: some View {
        GeometryReader { geometry in
            HStack() {
                
                VStack {
                    DBViewer(txViewModel: txViewModel, stmtViewModel: stmtViewModel)
                        .frame(width: geometry.size.width / 4, alignment: .leading)
                        .padding()
                }
                VStack {
                    TransactionViewer(viewModel: txViewModel)
                        .padding()
                    TransactionChart(viewModel: txViewModel)
                        .padding()
                }
                .frame(width: 3 * geometry.size.width / 4, alignment: .leading)
            }
        }
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}
