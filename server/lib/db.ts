import * as sqlite3 from "sqlite3";
import * as path from "path";
import * as fs from "fs";
import { Logger, ILogObj } from "tslog";
import { Transaction, TransactionMethod } from "./transactions";
import { Statement } from "./statements";
import { SQLITEError } from "./errors";

// TODO: determine install location
export const INSTALL_DIR = "/opt/vault";
export const TRANSACTION_DB_PATH = path.join(INSTALL_DIR, "transactions.db");

// Relative path to the directory of sql files
const SQL_INSTRUCTION_PATH = path.join(__dirname, "sql");

// Logger for all interactions with the DB
// Pipe to a file (and optionally hide from stdout)
const logger = new Logger({ name: "txDB" });
function logToTransport(logObject: ILogObj) {
    fs.appendFileSync(
        path.join(INSTALL_DIR, "txDB_log.txt"),
        JSON.stringify(logObject) + "\n",
    );
}
logger.attachTransport(logToTransport);

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
    GET_ALL_TX_ID: loadSQLCmd("tx_get_all_id"),
    GET_ONE_TX: loadSQLCmd("tx_get_one"),
    GET_ALL_TX_FOR_STMT: loadSQLCmd("tx_get_all_for_stmt"),
    GET_ALL_STMT: loadSQLCmd("stmt_get_all"),
    GET_ALL_STMT_ID: loadSQLCmd("stmt_get_all_id"),
    GET_ONE_STMT: loadSQLCmd("stmt_get_one"),
};

function errorParse(err): Error | undefined {
    // Catch specific errors and call the Promise reject
    if (SQLITEError.isSQLITEError(err)) {
        return new SQLITEError(err["code"]);
    } else if (err) {
        return err;
    }
    return undefined;
}

// Class representing a SQLite transaction database
export class TransactionDB {
    db: sqlite3.Database | undefined;
    dbPath: string | undefined;

    constructor() {
        this.db = undefined;
    }

    /**
     * Initialize the database and create tables if they don't exist.
     * @param dbPath - Path to the SQLite database file.
     */
    initialize(dbPath: string): Promise<TransactionDB> {
        logger.info(`Initializing DB to path: ${dbPath}`);
        return new Promise((res, rej) => {
            const db = new sqlite3.Database(dbPath);
            this.dbPath = dbPath;
            this.db = db;
            this.db.exec(SqlCommand.CREATE_TABLES, (err) => {
                let parsedErr = errorParse(err);
                parsedErr && rej(parsedErr);
            });
            res(this);
        });
    }

    /**
     * Close the database connection.
     */
    close(): Promise<TransactionDB> {
        logger.info(`Closing DB connection`);
        return new Promise((res, rej) => {
            this.db.close((err) => {
                let parsedErr = errorParse(err);
                parsedErr && rej(parsedErr);
            });
            res(this);
        });
    }

    /**
     * Clear all entries from the transactions table.
     */
    clear(): Promise<TransactionDB> {
        logger.info(`Clearing DB tables: ${this.dbPath}`);
        return new Promise((res, rej) => {
            this.db.exec(SqlCommand.CLEAR, (err) => {
                let parsedErr = errorParse(err);
                parsedErr && rej(parsedErr);
            });
            res(this);
        });
    }

    /**
     * Insert a transaction into the database.
     * @param tx - The transaction to be inserted.
     * @param stmtID - Statement ID associated with the transaction.
     */
    insertTransaction(
        tx: Transaction,
        stmtID: number = -1,
    ): Promise<TransactionDB> {
        logger.info(`Inserting Transaction (${stmtID})`);
        return new Promise((res, rej) => {
            this.db.run(
                SqlCommand.INSERT_TX,
                [...tx.toColumns(), stmtID],
                (err) => {
                    let parsedErr = errorParse(err);
                    parsedErr && rej(parsedErr);
                },
            );
            res(this);
        });
    }

    /**
     * Insert multiple transactions into the database.
     * @param txs - Array of transactions to be inserted.
     * @param stmtID - Statement ID associated with the transactions.
     */
    insertTransactions(
        txs: Transaction[],
        stmtID: number = -1,
    ): Promise<TransactionDB> {
        return new Promise((res, rej) => {
            Promise.all(
                txs.map((tx) => this.insertTransaction(tx, stmtID)),
            ).then((value) => res(this));
        });
    }

    getTransaction(txID: number): Promise<Transaction> {
        return new Promise((res, rej) => {
            this.db.all(SqlCommand.GET_ONE_TX, [txID], (err, rows: any[]) => {
                let parsedErr = errorParse(err);
                if (parsedErr) {
                    rej(err);
                } else if (rows.length == 0) {
                    rej(`No transaction with ${txID}`);
                } else {
                    res(Transaction.fromRecord(rows[0]));
                }
            });
        });
    }

    /**
     * Get all transactions from the database.
     */
    getAllTransactions(): Promise<Transaction[]> {
        return new Promise((res, rej) => {
            this.db.all(SqlCommand.GET_ALL_TX_ID, (err, rows: any[]) => {
                let parsedErr = errorParse(err);
                if (parsedErr) {
                    rej(err);
                } else if (rows == undefined || rows == null) {
                    res([]);
                } else {
                    const txPromises = rows.map((idJson) =>
                        this.getTransaction(idJson.id),
                    );
                    Promise.all(txPromises).then((txs) => res(txs));
                }
            });
        });
    }

    /**
     * Insert a statement and all of its transactions into the database.
     * @param stmt - The statement to be inserted.
     */
    insertStatement(stmt: Statement): Promise<TransactionDB> {
        logger.info(`Inserting Statement: ${JSON.stringify(stmt)}`);
        return new Promise((res, rej) => {
            this.db.run(SqlCommand.INSERT_STMT, stmt.toColumns(), (err) => {
                let parsedErr = errorParse(err);
                if (parsedErr) {
                    rej(parsedErr);
                } else {
                    this.insertTransactions(stmt.transactions, stmt.id).then(
                        (value) => res(this),
                    );
                }
            });
        });
    }

    getTransactionsForStatement(stmtID: number): Promise<Transaction[]> {
        return new Promise((res, rej) => {
            this.db.all(
                SqlCommand.GET_ALL_TX_FOR_STMT,
                stmtID,
                (err, rows: number[]) => {
                    let parsedErr = errorParse(err);
                    if (parsedErr) {
                        rej(parsedErr);
                    } else {
                        let txPromises = rows.map((txPartial) => {
                            return this.getTransaction(txPartial["id"]);
                        });
                        res(Promise.all(txPromises));
                    }
                },
            );
        });
    }

    /**
     * Get all statements from the database.
     */
    getAllStatements(): Promise<Statement[]> {
        return new Promise((res, rej) => {
            this.db.all(SqlCommand.GET_ALL_STMT_ID, (err, rows: number[]) => {
                let parsedErr = errorParse(err);
                if (parsedErr) {
                    rej(parsedErr);
                } else if (!err && (rows == undefined || rows == null)) {
                    res([]);
                } else {
                    Promise.all(
                        rows.map((idJson) => this.getStatement(idJson["id"])),
                    ).then((statements) => {
                        res(statements);
                    });
                }
            });
        });
    }

    /**
     * Get a statement by its ID from the database.
     * @param stmtID - The ID of the statement to retrieve.
     */
    getStatement(stmtID: number): Promise<Statement> {
        return new Promise((res, rej) => {
            this.db.all(SqlCommand.GET_ONE_STMT, stmtID, (err, rows: any[]) => {
                let parsedErr = errorParse(err);
                if (parsedErr) {
                    rej(parsedErr);
                } else if (rows.length == 0) {
                    rej(`No statement with id ${stmtID}`);
                } else {
                    this.getTransactionsForStatement(stmtID).then((txs) => {
                        let stmt = Statement.fromRecord({
                            transactions: txs,
                            ...rows[0],
                        });
                        res(stmt);
                    });
                }
            });
        });
    }
}
