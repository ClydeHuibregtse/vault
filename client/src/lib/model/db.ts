import { writable } from "svelte/store";
import type { Writable } from "svelte/store";

// TODO: find better home
// URL of the TxDB server
const DB_SERVER = "http://localhost:3000";

// Writeable Svelte Store:
// Client components subscribe to writes to this store
// and do not make API calls directly
export const statementStore: Writable<Statement[]> = writable([]);


// Interfaces for common records returned by the TxDB
export interface Transaction {
    id: number,
    date: Date,
    category: string,
    amount: number,
    method: string,
    description: string,
    stmt_id: number,
}
export interface Statement {
    id: number,
    pathToCSV: string,
    transactionMethod: string,
    transactions: Transaction[],
    date: Date,
}

class DBClient {
    constructor(
        public url: string,
        public statementStore: Writable<Statement[]>,
    ) {};

    async get(endpoint: string): Promise<Object | undefined> {
        const url = `${this.url}${endpoint}`;
        console.log(`GET: ${url}`);
        try {
          const response = await fetch(url);
          const data = response.json();
          console.log(`SUCCESS: ${url}`);
          return data;
        } catch (error) {
          console.error(`Error in getting ${endpoint}`, error);
          return undefined;
        }
    }

    async getFile(endpoint: string): Promise<Blob | undefined> {
        const url = `${this.url}${endpoint}`;
        console.log(`GET FILE: ${url}`);
        try {
          const response = await fetch(url);
          const data = response.blob();
          console.log(`SUCCESS: ${url}`);
          return data;
        } catch (error) {
          console.error(`Error in getting ${endpoint}`, error);
          return undefined;
        }
    }

    async post(endpoint: string, options: RequestInit): Promise<Object | undefined> {
        const url = `${DB_SERVER}${endpoint}`;
        console.log(`POST: ${url}`);
        console.log(options);
        try {
          const response = await fetch(url, options);
          const data = response.json();
          console.log(`SUCCESS: ${url}`);
          return data;
        } catch (error) {
          console.error(`Error in getting ${endpoint}`, error);
          return undefined;
        }
      }

    async getStatements(): Promise<Statement[]> {
        const data = (await this.get("/statements")) as Statement[];
        console.log(data);
        this.statementStore.set(data);
        return data;
    }

    async getTransactions(): Promise<Transaction[]> {
        const data = (await this.get("/transactions")) as Transaction[];
        return data;
    }

    async downloadStatement(id: number) {
        const data = await this.getFile(this.downloadStatementLink(id));
        return data;
    }

    downloadStatementLink(id: number): string {
        return `${this.url}/statements/${id}/download`;
    }

    async uploadStatement(
        file: File,
        date: Date,
        txMethod: string,
      ): Promise<Statement | undefined> {
        // Insert meta information about the upload
        let form = new FormData();
        form.append("file", file);
        form.append("date", date.toISOString());
        form.append("txMethod", txMethod);
      
        // Compile POST request initializer
        const requestOptions: RequestInit = {
          method: "POST",
          body: form,
        };
      
        // Upload
        const statement = await this.post(
          `/statements/upload?date=${date.toISOString()}&txMethod=${txMethod}`,
          requestOptions,
        );
        if (statement == undefined) {
            return undefined;
        }

        // Refresh the cache of statements
        await this.getStatements();
        return statement as Statement;
    }
}

export const dbClient = new DBClient(DB_SERVER, statementStore);
