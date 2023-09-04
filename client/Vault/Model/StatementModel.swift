//
//  Statements.swift
//  Vault
//
//  Created by Clyde Huibregtse on 9/3/23.
//

import Foundation

struct Statement: Identifiable, Codable {
    var id: Int
    var pathToCSV: String
    var transactionMethod: String
    var date: Date
}
