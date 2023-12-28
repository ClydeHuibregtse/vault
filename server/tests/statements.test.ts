import { Statement } from "../lib/statements.ts";
import { TransactionMethod } from "../lib/transactions.ts";


// A collection of CSV statements for use in tests
export const TEST_STATEMENTS_DIR = `${__dirname}/test_data`


export async function statementFactory(): Promise<Statement> {

    const filePath1 = `${TEST_STATEMENTS_DIR}/apple.csv`;
    const d1 = new Date("1998-06-01");
    const stmt1 = await Statement.fromCSV(
        filePath1,
        TransactionMethod.APPLE_CC,
        d1
    );
    return stmt1
}
