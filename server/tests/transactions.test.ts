
import { TransactionMethod, Transaction } from "../lib/transactions.ts";

export function transactionFactory(): Transaction {
    const d1 = new Date("1998-06-01");
    const tx = new Transaction(
        d1.toString(),
        "category",
        1234,
        TransactionMethod.APPLE_CC,
        "description"
    )
    return tx
}
