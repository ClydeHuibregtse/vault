import sqlite3 from "sqlite3";
import path from "path";
import fs from "fs";
import { Transaction, TransactionMethod } from "./transactions";
import { Statement } from "./statements";

// Relative path to the directory of sql files
const SQL_INSTRUCTION_PATH = path.join(__dirname, "sql");
// For now, store the db file in the same directory
export const TRANSACTION_DB_PATH = path.join(SQL_INSTRUCTION_PATH, "transactions.db");

// Make a custom type to hint at valid sql commands loaded from disk
type SqlString = string;

// Load a sql command from the file that defines it
function loadSQLCmd(cmd: string): SqlString {
    return fs.readFileSync(
        path.join(SQL_INSTRUCTION_PATH, `${cmd}.sql`),
        "utf-8",
    );
}

const SqlCommand = {
    CREATE_TABLES: loadSQLCmd("create"),
    CLEAR: loadSQLCmd("clear"),
    INSERT_TX: loadSQLCmd("tx_insert"),
    INSERT_STMT: loadSQLCmd("stmt_insert"),
    GET_ALL_TX: loadSQLCmd("tx_get_all"),
    GET_ALL_STMT: loadSQLCmd("stmt_get_all"),
    GET_ONE_STMT: loadSQLCmd("stmt_get_one")
};

function _defaultDBCallback(obj: any, err, res, rej) {
    if (err) {
        rej(err);
    } else {
        res(obj);
    }
}

export class TransactionDB {
    db: sqlite3.Database | undefined;

    constructor() {
        this.db = null;
    }

    // Create tables, if they don't already exist
    initialize(dbPath: string): Promise<TransactionDB> {
        console.log(`Initializing DB to path: ${dbPath}`);
        const db = new sqlite3.Database(dbPath);
        return new Promise((res, rej) => {
            this.db = db.exec(SqlCommand.CREATE_TABLES, (err) =>
                _defaultDBCallback(this, err, res, rej),
            );
        });
    }

    // Close DB connection
    close(): Promise<TransactionDB> {
        return new Promise((res, rej) => {
            this.db.close((err) => _defaultDBCallback(this, err, res, rej));
        });
    }

    // Clear all entries from Tx table
    clear(): Promise<TransactionDB> {
        return new Promise((res, rej) => {
            this.db.run(SqlCommand.CLEAR, (err) =>
                _defaultDBCallback(this, err, res, rej),
            );
        });
    }

    // Insert a transaction
    insertTransaction(
        tx: Transaction,
        stmtID: number = -1,
    ): Promise<TransactionDB> {
        console.log(`Inserting Transaction: ${[...tx.toColumns(), stmtID]}`);
        return new Promise((res, rej) => {
            this.db.run(
                SqlCommand.INSERT_TX,
                [...tx.toColumns(), stmtID],
                (err) => _defaultDBCallback(this, err, res, rej),
            );
        });
    }

    // Insert many transactions
    insertTransactions(
        txs: Transaction[],
        stmtID: number = -1,
    ): Promise<TransactionDB> {
        return new Promise((res, rej) => {
            txs.forEach((tx) => this.insertTransaction(tx, stmtID));
            res(this);
        });
    }

    // Returns all transactions in the table
    getAllTransactions(): Promise<Transaction[] | undefined> {
        return new Promise((res, rej) => {
            this.db.all(SqlCommand.GET_ALL_TX, (err, rows: Transaction[]) =>
                _defaultDBCallback(rows, err, res, rej),
            );
        });
    }

    // Insert statement and all of its transactions
    async insertStatement(stmt: Statement): Promise<TransactionDB> {
        return new Promise((res, rej) => {
            this.db.run(SqlCommand.INSERT_STMT, stmt.toColumns(), (err) =>
                _defaultDBCallback(this, err, res, rej),
            );
        }).then((db: TransactionDB) => {
            db.insertTransactions(stmt.transactions, stmt.id());
            return new Promise((res, rej) => res(db));
        });
    }

    getAllStatements(): Promise<Statement[] | undefined> {
        return new Promise((res, rej) => {
            this.db.all(SqlCommand.GET_ALL_STMT, (err, rows: Statement[]) =>
                _defaultDBCallback(rows, err, res, rej),
            );
        });
    }

    getStatement(stmtID: Number): Promise<Statement | undefined> {
        return new Promise((res, rej) => {
            this.db.all(SqlCommand.GET_ONE_STMT, stmtID, (err, rows: Statement[]) =>
                _defaultDBCallback(rows[0], err, res, rej),
            );
        });
    }

}

// (async () => {
//     const txDB = new TransactionDB();

//     await txDB.initialize(TRANSACTION_DB_PATH);
//     await txDB.clear();
//     const filePath1 = `${__dirname}/../data/apple.csv`;
//     const d1 = new Date("1998-06-01");
//     const d2 = new Date("1999-06-01");
//     const filePath2 = `${__dirname}/../data/activity-2.csv`;
//     // const stmt1 = await Statement.fromCSV(
//     //     filePath1,
//     //     TransactionMethod.APPLE_CC,
//     //     d1
//     // );
//     // const stmt2 = await Statement.fromCSV(filePath2, TransactionMethod.AMEX_CC, d2);
//     // console.log(stmt2)
//     // await txDB.insertStatement(stmt1);
//     // await txDB.insertStatement(stmt2);
//     // let txs = [];
//     // for (let i = 0; i < 10; i++) {
//     //     const tx1 = new Transaction("2023-06-16", "jkl;", 20.0 * i + 1, TransactionMethod.AMEX_CC, "a purchase")
//     //     // await txDB.insertTransaction(tx1);
//     //     txs.push(tx1);
//     // }
//     // const stmt = new Statement(txs, "test.csv");
//     // await txDB.insertTransactions(txs);
//     let txs_ = await txDB.getAllTransactions();
//     console.log(txs_);
//     await txDB.close();
// })();
