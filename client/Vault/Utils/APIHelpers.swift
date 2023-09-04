//
//  APIHelpers.swift
//  Vault
//
//  Created by Clyde Huibregtse on 9/3/23.
//

import Foundation

let SERVER_URL = "http://127.0.0.1:3000"

func requestJSON<T>(endpoint: String, callback: @escaping (T) -> Void) where T: Decodable {
    print("Making call to \(endpoint)")
    // Create a URL object for the API endpoint
    let urlString = "\(SERVER_URL)\(endpoint)"
    guard let url = URL(string: urlString) else {
        fatalError("Invalid URL")
    }
    // Create a URL session
    let session = URLSession.shared

    // Create a data task
    let task = session.dataTask(with: url) { data, response, error in
        if let error = error {
            print("Error: \(error)")
            return
        }
        // Check if there's any data returned
        if let data = data {
            do {
                let decoder = JSONDecoder()
                let dateFormatter = DateFormatter()
                dateFormatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ss.sssZ"
                decoder.dateDecodingStrategy = .formatted(dateFormatter)
                let data = try decoder.decode(T.self, from: data)
//                print("Call to \(endpoint) returned \(data)")
                DispatchQueue.main.async {
                    callback(data)
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

func downloadFile(endpoint: String, filename: String) {
    
    // Get the User's downloads directory
    let documentsDirectory = FileManager.default.urls(
        for: .documentDirectory,
        in: .userDomainMask
    )
        .first!

    // Destination where the file will land at the end
    let destinationURL = documentsDirectory.appendingPathComponent(filename)

    // Fully qualified URL to the asset on the server
    let serverURL = URLRequest(url: URL(string: "\(SERVER_URL)\(endpoint)")!)
    
    let task = URLSession.shared.downloadTask(with: serverURL) { (tempURL, response, error) in
        if let error = error {
            print("Error downloading file: \(error)")
        } else if let tempURL = tempURL {
            do {
                try FileManager.default.moveItem(at: tempURL, to: destinationURL)
                print("File downloaded and moved to: \(destinationURL)")

                // You can open the file, or perform any other action here if needed.
            } catch {
                print("Error moving file: \(error)")
            }
        }
    }
    task.resume()
}

