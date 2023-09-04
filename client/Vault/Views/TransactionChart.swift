//
//  TransactionChart.swift
//  Vault
//
//  Created by Clyde Huibregtse on 8/28/23.
//

import Foundation
import SwiftUI
import Charts

struct TransactionChart: View {
    @ObservedObject var viewModel: TransactionsViewModel

    var body: some View {
        let methods = viewModel.getMethods()
    
        Chart {
            ForEach(methods, id: \.self) { method in
                BarMark(
                    x: .value("Transaction Method", method),
                    y: .value("Number of Transactions", viewModel.filterBy(method: method).map({ tx in
                        tx.amount
                    }).reduce(0, +))
                )
            }
        }
        .aspectRatio(3.0, contentMode: .fit)
        .padding()
        .onAppear {
            viewModel.fetchTransactions()
        }
    }
}
