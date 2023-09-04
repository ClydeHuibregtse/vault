//
//  StatementViewModel.swift
//  Vault
//
//  Created by Clyde Huibregtse on 9/3/23.
//

import Foundation

class StatementsViewModel: ObservableObject {
    @Published var statements: [Statement] = []

    func fetchStatements(forceFetch: Bool = false) {
        if self.statements.count != 0 && !forceFetch {
            return
        }
        requestJSON(endpoint:"/statements") { result in
            self.statements = result
        }
    }
    
    // Add a single statement from the User-provided filepath
    func addStatement(stmtPath: String) {
        
    }
    
    
    // Return all transactions matching some filter
//    func filterBy() -> [Statement] {
//        var matchingStatements: [Statement] = []
//        for stmt in self.statements {
//
//        }
//        return matchingStatements
//    }
    
    // Other methods and properties related to item management
}
