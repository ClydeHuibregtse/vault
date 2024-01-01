import express from 'express';
import type { Express } from 'express';
import fs from 'fs';
import path from "path";
import multer from 'multer';
import cors from 'cors';
import http from 'http';
import { Logger, ILogObj } from 'tslog';

import { TransactionDB, TRANSACTION_DB_PATH, INSTALL_DIR } from "./lib/db";
import { Statement, STATEMENT_STORAGE_PATH } from "./lib/statements";
import { TransactionMethod, stringToTransactionMethod } from './lib/transactions';

// Setup logger for API interactions
const logger = new Logger({ name: "txDB" });
function logToTransport(logObject: ILogObj) {
    fs.appendFileSync(
        path.join(INSTALL_DIR, "api_log.txt"),
        JSON.stringify(logObject) + "\n"
    );
}
logger.attachTransport(logToTransport)

const port = 3000
export function makeApp(dbPath: string = TRANSACTION_DB_PATH, clear: boolean = false): Express {
    // Start application
    const app = express()

    // Allow for CORS for localhost data transfer
    app.use(cors())

    // Initialize new database
    const db = new TransactionDB();
    db.initialize(dbPath);
    // TODO: Handle re-initialization
    if (clear) {
        db.clear();
    }

    /** 
     *  Public API  *
    */
    app.get('/', (req, res) => {
        res.send('Hello World!');
    })

    app.get("/transactions", (req, res) => {
        logger.info(`User requests all Transactions`)
        db.getAllTransactions().then((data) => res.send(data.map((v) => v.toJSON())));
    })

    app.get("/statements", (req, res) => {
        logger.info(`User requests all Statements`)
        db.getAllStatements().then((data) => res.send(data.map((v) => v.toJSON())));
    })

    app.get("/statements/:stmtID/download", async (req, res) => {
        const stmtID = parseInt(req.params.stmtID);
        logger.info(`User requests Statement: ${stmtID}`);

        // Look up the statement in the DB
        try {
            var stmt = await db.getStatement(stmtID);
        } catch (dbError) {
            return res.status(404).send(`Statement ${stmtID} not found`)
        }
        
        // Check if the file exists
        if (!fs.existsSync(stmt.pathToCSV)) {
            return res.status(404).send('CSV file not found');
        }

        const downloadName = `${stmt.transactionMethod}`.replace(/\s+/g, '');

        // Send the file
        res.download(stmt.pathToCSV, downloadName);
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
        logger.info(`User uploading Statement`);

        // The uploaded file is available in req.file.
        if (req["file"] == undefined) {
            return res.status(400).json('No file uploaded.');
        }
        logger.info(`Receiving uploaded file: ${req["file"]}`);

        // Get the transaction method
        const transactionMethod = req.body.txMethod;
        if (transactionMethod == undefined) {
            return res.status(400).json('Bad request: TX Method not found in query');
        }

        const filePath = path.join(req["file"].destination, req["file"].filename)
        logger.info(`User is uploading a CSV for ${transactionMethod} to filepath: ${filePath}`)
        const stmt = await Statement.fromCSV(
            filePath,
            stringToTransactionMethod(transactionMethod as string)
        );
        await db.insertStatement(stmt);
        logger.info(`All ${stmt.transactions.length} txs are inserted`);
        
        res.status(200).json({
            numberTx: stmt.transactions.length
        });
    });
    return app

}

// Start only if we run this as the main module
if (require.main === module) {
    const app = makeApp();
    const server = app.listen(port, "0.0.0.0", () => {
        logger.info(`Vault listening on port ${port}`)
    })
}