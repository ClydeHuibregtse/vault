/*
    Module for handling any type of tabular statement
*/
import fs from "fs";
import csvParser from "csv-parser";
import { hash } from "./hash";
import { TransactionMethod, Transaction, RawTransaction } from "./transactions";

export class Statement {
    constructor(
        public transactions: Transaction[],
        public pathToCSV: string,
        public transactionMethod: TransactionMethod,
    ) {}

    toColumns(): any[] {
        return [this.hash(), this.pathToCSV, this.transactionMethod];
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
    ): Promise<Statement> {
        const txs = await Statement.readCSV(pathToCSV, txMethod);
        return new Statement(txs, pathToCSV, txMethod);
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
