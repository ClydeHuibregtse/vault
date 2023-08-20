-- This inserts a new transaction to the db
INSERT INTO transactions 
    (date, category, amount, method, description, stmt_id) 
    VALUES 
    (?, ?, ?, ?, ?, ?)