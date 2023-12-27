//
//  StatementUpload.swift
//  Vault
//
//  Created by Clyde Huibregtse on 9/4/23.
//

import Foundation
import SwiftUI

// Interface for configuring a single statement to be uploaded
struct StatementConfig: View {
    
    var stmtFile: URL
    var txMethods: Set<String>
    let onFormChange: (URL, String, Date) -> Void
    let onDelete: () -> Void
    
    @State private var selectedDate = Date()
    @State private var selectedTxMethod: String = ""
    

    @State private var isCustomEntrySelected = false
    
    var body: some View {
        HStack {
            // Select Date
            DatePicker("Select a Date", selection: $selectedDate, displayedComponents: .date)
                .datePickerStyle(GraphicalDatePickerStyle())
                .labelsHidden()
                .padding()
                .onChange(of: selectedDate) { newValue in
                    onFormChange(stmtFile, selectedTxMethod, newValue)
                }

            // Select Transaction Method
            VStack {
                Picker("Transaction Method", selection: $selectedTxMethod) {
                    ForEach(Array(txMethods), id: \.self) { method in
                        Text(method).tag(method)
                    }
                }
                .padding()
                .frame(minWidth: 300)
                .onChange(of: selectedTxMethod) { newValue in
                    onFormChange(stmtFile, newValue, selectedDate)
                }.pickerStyle(MenuPickerStyle())
                
                if isCustomEntrySelected {
                    TextField("Enter your own", text: $selectedTxMethod)
                        .textFieldStyle(RoundedBorderTextFieldStyle())
                }
                Toggle("Write your own", isOn: $isCustomEntrySelected)
            }
            
            // What file is this?
            Text("\(stmtFile)")
                .padding()
            
            // Remove this entry
            Button(action: {
                print("Revoming file from upload queue: \(stmtFile)")
                onDelete()
            }) {
                Text(X_ICON)
            }.padding()
            
        }.layoutPriority(1)
    }
}



struct StatementUploadForm: View {
    
    // Pointer to the statement/tx ViewModel to initiate the API
    // calls on submit
    @ObservedObject var stmtViewModel: StatementsViewModel
    @ObservedObject var txViewModel: TransactionsViewModel
    
    // Binding to the state property that controls the modal presentation
    @Binding var isUploadFormShowing: Bool
    
    @State var transactionMethods: Set<String>
    
    @State private var isShowingFilePicker = false
    @State private var statementFiles: Set<URL> = Set()
    @State private var isUploading = false

    // Indexable via statement pathToCSV, which uniquely identifies
    @State var statementConfigs: [URL: Statement] = [:]
    
    
    
    var body: some View {
        Form {
            HStack{
                // Add new statements
                VStack{
                    // Add
                    Button(action: {
                        print("Adding new statements")
                        isShowingFilePicker = true
                    }){
                        Text(PLUS_ICON)
                    }
                    .fileImporter(
                        isPresented: $isShowingFilePicker,
                        allowedContentTypes: [.commaSeparatedText],
                        allowsMultipleSelection: true
                    ){ result in
                        switch result {
                        case .success(let files):
                            files.forEach { file in
                                // gain access to the directory
                                let gotAccess = file.startAccessingSecurityScopedResource()
                                if !gotAccess { return }
                                // access the directory URL
                                statementFiles.insert(file)
                                // release access
                                file.stopAccessingSecurityScopedResource()
                            }
                        case .failure(let error):
                            // handle error
                            print(error)
                        }
                    }
                    // Upload
                    Button(action: {
                        
                        isUploading = true
                        
                        Task {
                            print("Submitting new statements!")
                            
                            let out = await stmtViewModel.uploadStatements(
                                stmts: Array(statementConfigs.values),
                                cb: {
                                    print("ABOUT TO FETCH")
                                    stmtViewModel.fetchStatements()
                                    txViewModel.fetchTransactions()
                                    isUploading = false
                                    isUploadFormShowing.toggle()
                                }
                            )
                        }
                    }) {
                        Text(UPLOAD_ICON)
                    }.disabled(isUploading)
                }
                .padding()
                Spacer()
                // View existing Statements
                VStack{
                    ForEach(Array(statementFiles), id: \.self) { file in
                        StatementConfig(
                            stmtFile: file,
                            txMethods: transactionMethods,
                            onFormChange: self.modifyFileConfig,
                            onDelete: { self.removeFile(file: file) }
                        ).padding()
                        
                    }
                }
            }
                
        }
    }
    
    private func removeFile(file: URL) {
        self.statementFiles.remove(file)
    }
    
    private func modifyFileConfig(file: URL, txMethod: String, date: Date) {
        self.statementConfigs[file] = Statement(
            id: 0, // N/A ??
            pathToCSV: "\(file)",
            transactionMethod: txMethod,
            date: date
        )
        print(self.statementConfigs)
    }
}



    
