//
//  TransactionViewModel.swift
//  Vault
//
//  Created by Clyde Huibregtse on 8/27/23.
//

import Foundation

class TransactionsViewModel: ObservableObject {
    @Published var transactions: [Transaction] = []

    func fetchItems() {
        
        // Create a URL object for the API endpoint
        let urlString = "http://127.0.0.1:3000/transactions"
        guard let url = URL(string: urlString) else {
            fatalError("Invalid URL")
        }
        print(urlString)
        // Create a URL session
        let session = URLSession.shared

        // Create a data task
        let task = session.dataTask(with: url) { data, response, error in
            if let error = error {
                print("Error: \(error)")
                return
            }
            print("YO")
            // Check if there's any data returned
            if let data = data {
                do {
                    print(data)
                    // Parse the data as needed (assuming JSON response)
                    if let json = try JSONSerialization.jsonObject(with: data, options: []) as? [String: Any] {
                        print("Response JSON: \(json)")
                    }
                } catch {
                    print("JSON Parsing Error: \(error)")
                }
            }
        }
        print("Starting task")
        // Start the data task
        task.resume()
    }
    
    func addItem(_ tx: Transaction) {
        // Add an item to the data source and update the 'items' property
    }
    
    // Other methods and properties related to item management
}
