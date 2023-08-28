import express from 'express';
import { TransactionDB, TRANSACTION_DB_PATH } from "./lib/db";
const app = express()
const port = 3000

const db = new TransactionDB();
db.initialize(TRANSACTION_DB_PATH);

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

app.get("/transactions", (req, res) => {
  console.log(`User requests all Transactions`)
  db.getAllTransactions().then((data) => res.send(data));
})