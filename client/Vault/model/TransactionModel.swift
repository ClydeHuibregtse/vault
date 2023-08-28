//
//  TransactionModel.swift
//  Vault
//
//  Created by Clyde Huibregtse on 8/27/23.
//

import Foundation

struct Transaction: Identifiable {
    var id: Int
    var date: Date
    var amount: Float
    var method: String
    var description: String
    var statementID: Int
}
