
-- This creates a table of statements in the transaction DB
CREATE TABLE IF NOT EXISTS statements (
    id INTEGER PRIMARY KEY,
    date DATE,
    pathToCSV TEXT,
    transactionMethod TEXT
);


-- This creates a table of transactions in the transaction DB
CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY,
    date DATE,
    category TEXT,
    amount REAL,
    method TEXT,
    description TEXT,
    stmt_id INTEGER,
    FOREIGN KEY (stmt_id) REFERENCES statements(id)
);
