import express from 'express';
import { TransactionDB, TRANSACTION_DB_PATH } from "./lib/db";
import fs from 'fs';
const app = express()
const port = 3000

const db = new TransactionDB();
db.initialize(TRANSACTION_DB_PATH);

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, "0.0.0.0", () => {
  console.log(`Example app listening on port ${port}`)
})

app.get("/transactions", (req, res) => {
  console.log(`User requests all Transactions`)
  db.getAllTransactions().then((data) => res.send(data));
})

app.get("/statements", (req, res) => {
  console.log(`User requests all Statements`)
  db.getAllStatements().then((data) => res.send(data));
})

app.get("/statements/:stmtID/download", (req, res) => {
  const stmtID = req.params.stmtID;
  console.log(`User requests Statement: ${stmtID}`)
  db.getStatement(stmtID).then((stmt) => {
    
    // Check if the file exists
    if (!fs.existsSync(stmt.pathToCSV)) {
      return res.status(404).send('CSV file not found');
    }
    
    // Set the content type to CSV
    const date = new Date(stmt.date);

    const downloadName = `${stmt.transactionMethod}_${date.getFullYear()}_${date.getMonth()}`.replace(/\s+/g, '');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `'attachment; filename="${downloadName}.csv"'`);

    res.sendFile(stmt.pathToCSV);
  });
})

