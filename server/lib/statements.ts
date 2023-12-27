/*
    Module for handling any type of tabular statement
*/
import fs from "fs";
import path from "path";
import csvParser from "csv-parser";
import { hash } from "./hash";
import { TransactionMethod, Transaction, RawTransaction } from "./transactions";

export const STATEMENT_STORAGE_PATH = path.join(__dirname, "..", "data");

export class Statement {
    constructor(
        public transactions: Transaction[],
        public pathToCSV: string,
        public transactionMethod: TransactionMethod,
        public date: Date
    ) {}

    toColumns(): any[] {
        return [this.hash(), path.resolve(this.pathToCSV), this.transactionMethod, this.date.toISOString()];
    }

    private hash(): number {
        return hash(JSON.stringify(this));
    }

    public id(): number {
        return this.hash();
    }

    static async fromCSV(
        pathToCSV: string,
        txMethod: TransactionMethod,
        date: Date
    ): Promise<Statement> {
        const txs = await Statement.readCSV(pathToCSV, txMethod);
        return new Statement(txs, pathToCSV, txMethod, date);
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

// (async () => {
//     try {
//         // const catFinder: CategoryFinder = new CategoryFinder("test")
//         // catFinder.getCategory();

//         const filePath = `${__dirname}/../data/activity-2.csv`;
//         const stmt = await Statement.fromCSV(filePath);
//         console.log(stmt);
//     } catch (error) {
//         console.error("Error reading CSV file:", error);
//     }
// }) ();
