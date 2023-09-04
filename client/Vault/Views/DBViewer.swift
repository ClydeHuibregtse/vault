//
//  DBViewer.swift
//  Vault
//
//  Created by Clyde Huibregtse on 9/3/23.
//

import Foundation



import Foundation
import SwiftUI

let PLUS_ICON = "\u{002B}"
let DOWNLOAD_ICON = "\u{2913}"

func makeButton(title: String, callback: @escaping () -> Void) -> some View {

    return Button(action: {
        print("Button Clicked: \(title)")
        callback()
    }) {
        Text(title)
            .font(.headline)
            .fontWeight(Font.Weight.bold)
    }
        .foregroundColor(.white)
        .cornerRadius(5)
        .padding(3)
}


struct DBButtons: View {
    
    @ObservedObject var viewModel: TransactionsViewModel
    
    var body: some View {
        HStack {
            makeButton(title: PLUS_ICON, callback: {
                print("Adding a new statement")
            })
            makeButton(title: DOWNLOAD_ICON) {
                print("Downloading result DB")
            }
            Spacer()
        }
    }
    
}


struct StatementListGroup : Identifiable {
    var id = UUID()
    var name: String
    var statements: [Statement]
}

func toListingGroup(statements: [Statement]) -> [StatementListGroup] {

    // Formatter to translate our SQL response
    // into just the year and month
    let dateFormatter: DateFormatter = {
        let formatter = DateFormatter()
        formatter.dateFormat = "MMMM, yyyy"
        formatter.locale = Locale(identifier: "en_US")
        return formatter
    }()
    
    var months: [String: [Statement]] = [:]
    for stmt in statements {
        let englishMonth = dateFormatter.string(from: stmt.date)
        if months[englishMonth] != nil {
            months[englishMonth]?.append(stmt)
        } else {
            months[englishMonth] = [stmt]
        }
    }
    let statementGroups = months.map { (key: String, stmts: [Statement]) in
        return StatementListGroup(
            name: key,
            statements: stmts
        )
    }
    return statementGroups
    
}

struct StatementListing: View {
    var stmt: Statement

    var body: some View {
        HStack {
            Text("\(stmt.transactionMethod)")
            Spacer()
            Button(action: {
                downloadFile(
                    endpoint: "/statements/\(stmt.id)/download",
                    filename: "\(stmt.date.description)_\(stmt.transactionMethod)" )
            }) {
                Text(DOWNLOAD_ICON)
            }
        }
        .frame(maxWidth: .infinity)

    }
}

struct DBStatements: View {
    @ObservedObject var viewModel: StatementsViewModel
    var body: some View {
        VStack {
            Text("^[\(viewModel.statements.count) statements](inflect: true)")
            List {
                ForEach(toListingGroup(statements: viewModel.statements)) { slg in
                    Section(header: Text(slg.name)) {
                        ForEach(slg.statements) { stmt in
                            StatementListing(stmt: stmt)
                        }
                    }
                    
                }
            }
        }
        .frame(maxWidth: .infinity)
    }
        
}



struct DBViewer: View {
    @ObservedObject var txViewModel: TransactionsViewModel
    @ObservedObject var stmtViewModel: StatementsViewModel
    
    var body: some View {
    
        VStack {
            // Buttons
            DBButtons(viewModel: txViewModel)
            
            // Statement listing
            DBStatements(viewModel: stmtViewModel)
        }
            .onAppear {
                txViewModel.fetchTransactions()
                stmtViewModel.fetchStatements()
            }
    }
        
}

