//
//  TransactionModel.swift
//  Vault
//
//  Created by Clyde Huibregtse on 8/27/23.
//

import Foundation

struct Transaction: Identifiable, Codable {
    var id: Int
    var date: String
    var amount: Float
    var method: String
    var description: String
    var stmt_id: Int
    
    func stringAmount() -> String {
        let nf = NumberFormatter()
        return nf.string(for: self.amount)!
    }
}
