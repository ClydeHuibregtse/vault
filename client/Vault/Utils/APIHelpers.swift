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
                DispatchQueue.main.async {
                    callback(data)
                }

            } catch {
                print("JSON Parsing Error: \(error)")
            }
        }
    }
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

func createQueryString(from parameters: [String: String]) -> String {
    var queryItems: [String] = []
    
    for (key, value) in parameters {
        if let encodedKey = key.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed),
           let encodedValue = value.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) {
            queryItems.append("\(encodedKey)=\(encodedValue)")
        }
    }
    
    return queryItems.isEmpty ? "" : "?" + queryItems.joined(separator: "&")
}

func uploadCSV(fileURL: URL, kwargs: [String: String], cb: @escaping () -> Void) async {
    
    let addlParams = createQueryString(from: kwargs)
    let url = URL(string: "\(SERVER_URL)/statements/upload\(addlParams)")!
    var request = URLRequest(url: url)
    request.httpMethod = "POST"
    
    let boundary = UUID().uuidString
    request.setValue("multipart/form-data; boundary=\(boundary)", forHTTPHeaderField: "Content-Type")
    
    var body = Data()
    
    // Append file data to the request body.
    do {
        let fileData = try Data(contentsOf: fileURL)
        let fileName = fileURL.lastPathComponent
        
        body.append("--\(boundary)\r\n".data(using: .utf8)!)
        body.append("Content-Disposition: form-data; name=\"file\"; filename=\"\(fileName)\"\r\n".data(using: .utf8)!)
        body.append("Content-Type: application/csv\r\n\r\n".data(using: .utf8)!)
        body.append(fileData)
        body.append("\r\n".data(using: .utf8)!)
        body.append("--\(boundary)--\r\n".data(using: .utf8)!)
    } catch {
        print("Error reading file data: \(error)")
        return
    }
    request.httpBody = body
    
    let uploadTask = URLSession.shared.dataTask(with: request) { data, response, error in
        if let error = error {
            print("Error: \(error)")
        } else if let data = data, let response = response as? HTTPURLResponse {
            if response.statusCode == 200 {
                cb()
                print("File uploaded successfully.")
            } else {
                print("HTTP Status Code: \(response.statusCode)")
            }
        }
    }.resume()
}
