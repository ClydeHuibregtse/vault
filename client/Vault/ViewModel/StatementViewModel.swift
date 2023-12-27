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
        print("Fetching all statements")
//        if self.statements.count != 0 && !forceFetch {
//            return
//        }
        requestJSON(endpoint:"/statements") { result in
            self.statements = result
        }
    }
    
    // Add a single statement
    func uploadStatement(stmt: Statement, cb: @escaping () -> Void) async {
        Task {
            do {
                let res = await uploadCSV(
                    fileURL: URL(string: stmt.pathToCSV)!,
                    kwargs: ["date": "\(stmt.date.formatted(date: .long, time: .omitted))", "txMethod": "\(stmt.transactionMethod)"],
                    cb: cb
                )
                print("One statement inserted")
            }
        }
        
    }
    // Add many statements
    func uploadStatements(stmts: [Statement], cb: @escaping () -> Void) async -> String {
        for stmt in stmts {
            await self.uploadStatement(stmt: stmt, cb: cb)
        }
        return "Cool"
    }
}
