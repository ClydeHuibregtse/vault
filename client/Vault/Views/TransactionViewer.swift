//
//  TransactionViewer.swift
//  Vault
//
//  Created by Clyde Huibregtse on 8/28/23.
//

import Foundation
import SwiftUI

struct TransactionViewer: View {
    @ObservedObject var viewModel: TransactionsViewModel
    
    @State private var selection = Set<Transaction.ID>()
    @State private var sortOrder = [KeyPathComparator(\Transaction.date)]
    
    var body: some View {

        VStack {
            Text("^[\(selection.count) transactions selected](inflect: true, morphology: {partOfSpeech: \"adjective\"})")
                .padding()
                .frame(maxWidth: .infinity)
            Table(viewModel.transactions, selection: $selection, sortOrder: $sortOrder) {
                TableColumn("Date", value: \.date)
                TableColumn("Method", value: \.method)
                TableColumn("Description", value: \.description)
                TableColumn("Amount", value: \.amount) { tx in
                    Text(String(tx.amount))
                }
            }
            .frame(maxWidth: .infinity)
            .onChange(of: sortOrder) {
                viewModel.transactions.sort(using: $0)
            }
        }
        .frame(maxWidth: .infinity)
        .onAppear {
            viewModel.fetchTransactions()
        }

    }
}
