/*
    Module for handling any type of tabular statement
*/
import * as fs from "fs";
import * as path from "path";
import csvParser from "csv-parser";

import { hash } from "./hash";
import {
    TransactionMethod,
    Transaction,
    RawTransaction,
    stringToTransactionMethod,
} from "./transactions";

export const STATEMENT_STORAGE_PATH = path.join(__dirname, "..", "data");

export class Statement {
    constructor(
        public transactions: Transaction[],
        public pathToCSV: string,
        public transactionMethod: TransactionMethod | undefined,
    ) {}

    toJSON(): Record<string, any> {
        let json = {};
        Object.keys(this).forEach((key) => (json[key] = this[key]));
        return json;
    }

    toColumns(): any[] {
        return [
            path.resolve(this.pathToCSV),
            this.transactionMethod,
        ];
    }

    static async fromCSV(
        pathToCSV: string,
        txMethod: TransactionMethod | undefined
    ): Promise<Statement> {
        const txs = await Statement.readCSV(pathToCSV, txMethod);
        let stmt = new Statement(txs, pathToCSV, txMethod);
        return stmt;
    }

    static fromRecord(object: Record<string, any>): Statement {
        return new Statement(
            object.transactions,
            object.pathToCSV,
            stringToTransactionMethod(object.transactionMethod),
        );
    }

    static readCSV(
        pathToCSV: string,
        txMethod: TransactionMethod,
    ): Promise<Transaction[]> {
        return new Promise((resolve, reject) => {
            const results: Transaction[] = [];
            fs.createReadStream(pathToCSV)
                .pipe(csvParser())
                .on("data", (data: RawTransaction) =>
                    results.push(Transaction.fromRaw(data, txMethod)),
                )
                .on("end", () => resolve(results))
                .on("error", (error) => reject(error));
        });
    }
}
