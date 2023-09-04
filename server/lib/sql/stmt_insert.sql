-- This inserts a new transaction to the db
INSERT INTO statements 
    (id, pathToCSV, transactionMethod, date) 
    VALUES 
    (?, ?, ?, ?)