//
//  TransactionViewModel.swift
//  Vault
//
//  Created by Clyde Huibregtse on 8/27/23.
//

import Foundation

class TransactionsViewModel: ObservableObject {
    @Published var transactions: [Transaction] = []

    func fetchTransactions(forceFetch: Bool = false) {
        if self.transactions.count != 0 && !forceFetch {
            return
        }
        requestJSON(endpoint:"/transactions") { result in
            self.transactions = result
        }
    }
    
    func addItem(_ tx: Transaction) {
        // Add an item to the data source and update the 'items' property
    }
    
    // Return all of the unique methods in self.transactions
    func getMethods() -> [String] {
        var uniqueCategories: Set<String> = []
        for tx in self.transactions {
            uniqueCategories.insert(tx.method)
        }
        return Array(uniqueCategories)
    }
    
//    // Return the IDs of all statements
//    func getStatementIDs() -> [String] {
//        
//    }
    
    // Return all transactions matching some filter
    func filterBy(method: String) -> [Transaction] {
        var matchingTransactions: [Transaction] = []
        for tx in self.transactions {
            if tx.method == method { // Add more conditions here
                matchingTransactions.append(tx)
            }
        }
        return matchingTransactions
    }
    
    // Other methods and properties related to item management
}
