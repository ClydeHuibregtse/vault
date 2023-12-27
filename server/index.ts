import express from 'express';
import fs from 'fs';
import path from "path";
import multer from 'multer';

import { TransactionDB, TRANSACTION_DB_PATH } from "./lib/db";
import { Statement, STATEMENT_STORAGE_PATH } from "./lib/statements";
import { TransactionMethod, stringToTransactionMethod } from './lib/transactions';


const app = express()
const port = 3000

const db = new TransactionDB();
db.initialize(TRANSACTION_DB_PATH);
db.clear();

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

// Configure multer to specify the storage location for uploaded files.
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, STATEMENT_STORAGE_PATH); // Files will be saved in the 'uploads/' directory.
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); // Use the original filename for the uploaded file.
  },
});

// Create a multer instance with the storage configuration.
const upload = multer({ storage });

app.post("/statements/upload", upload.single('file'), async (req, res) => {
  // The uploaded file is available in req.file.
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }
  // Get these from the URL
  console.log(req.query.date);
  const date = new Date(req.query.date);
  const transactionMethod = req.query.txMethod;

  const filePath = path.join(req.file.destination, req.file.filename)
  console.log(`User is uploading a CSV for ${date}, ${transactionMethod} to filepath: ${filePath}`)
  const stmt = await Statement.fromCSV(
    filePath,
    stringToTransactionMethod(transactionMethod),
    date
  );
  await db.insertStatement(stmt);
  console.log("All txs are inserted");
  res.status(200).send(`File '${filePath}' uploaded successfully.`);
});

