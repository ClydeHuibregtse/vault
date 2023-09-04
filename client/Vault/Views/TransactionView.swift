//
//  TransactionView.swift
//  Vault
//
//  Created by Clyde Huibregtse on 8/27/23.
//

import SwiftUI

struct TransactionView: View {
    @ObservedObject var viewModel: TransactionsViewModel
    
    var body: some View {
        List(viewModel.transactions) { item in
            Text(item.description)
        }
        .onAppear {
            viewModel.fetchItems()
        }
    }
}
