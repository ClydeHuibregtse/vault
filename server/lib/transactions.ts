/*
Module for handling transaction information
*/

// import { CategoryFinder } from "./categories";

function matchesInterface(obj: any, int) {
    for (const key in obj) {
        if (!int.hasOwnProperty(key)) {
            return false;
        }
    }
    return true;
}

export enum TransactionMethod {
    AMEX_CC = "American Express CC",
    FIDELITY_CC = "Fidelity CC",
    FIDELITY_DC = "Fidelity DC",
    APPLE_CC = "Apple CC",
    CASH = "Cash",
}

export function stringToTransactionMethod(
    value: string,
): TransactionMethod | undefined {
    if (value == TransactionMethod.AMEX_CC) {
        return TransactionMethod.AMEX_CC;
    }
    if (value == TransactionMethod.FIDELITY_CC) {
        return TransactionMethod.FIDELITY_CC;
    }
    if (value == TransactionMethod.FIDELITY_DC) {
        return TransactionMethod.FIDELITY_DC;
    }
    if (value == TransactionMethod.APPLE_CC) {
        return TransactionMethod.APPLE_CC;
    }
    if (value == TransactionMethod.CASH) {
        return TransactionMethod.CASH;
    }
}

export class Transaction {
    constructor(
        public date: string,
        public category: string,
        public amount: number,
        public method: TransactionMethod,
        public description: string,
        public stmt_id: number = -1,
    ) {}

    public toColumns(): any[] {
        return [
            this.date,
            this.category,
            this.amount,
            this.method,
            this.description,
        ];
    }

    public toJSON(): Record<string, any> {
        let json = {};
        Object.keys(this).forEach((key) => (json[key] = this[key]));
        return json;
    }

    public static fromRaw(data: any, txMethod: TransactionMethod): Transaction {
        // Apple Card
        if (txMethod == TransactionMethod.APPLE_CC) {
            return new Transaction(
                data["Transaction Date"],
                data.Category,
                parseFloat(data["Amount (USD)"]),
                TransactionMethod.APPLE_CC,
                data.Description,
            );
        }

        // Amex Card
        if (txMethod == TransactionMethod.AMEX_CC) {
            return new Transaction(
                data.Date,
                data.Category,
                parseFloat(data.Amount),
                TransactionMethod.AMEX_CC,
                data.Description,
            );
        }
    }

    public static fromRecord(obj: Record<string, any>): Transaction {
        return new Transaction(
            obj.date,
            obj.category,
            obj.amount,
            obj.method,
            obj.description,
            obj.stmt_id,
        );
    }
}

interface AmexTransaction {
    Date: string;
    Description: string;
    Amount: string;
    Address: string;
    Country: string;
    Reference: string;
    Category: string;
}

interface AppleTransaction {
    "Transaction Date": string;
    "Clearing Date": string;
    Description: string;
    Merchant: string;
    Category: string;
    Type: string;
    "Amount (USD)": string;
    "Purchased By": string;
}

export type RawTransaction = AmexTransaction | AppleTransaction;

export function fromCardString(cardString: string): TransactionMethod {
    // TODO: implement

    return TransactionMethod.AMEX_CC;
}
