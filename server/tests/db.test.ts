import * as chai from 'chai';
import * as mocha from 'mocha';
import * as tmp from 'tmp';
import * as fs from 'fs';
import * as assert from 'assert';

import { TransactionDB } from "../lib/db.ts";
import { statementFactory } from "./statements.test.ts";
import { transactionFactory } from './transactions.test.ts';
import { Transaction } from '../lib/transactions.ts';

mocha.describe('TransactionDB', () => {
    
    it('should initialize and have no contents', async () => {
        
        const db = new TransactionDB()
        await db.initialize(":memory:");
        const stmts = await db.getAllStatements();
        const txs = await db.getAllTransactions();

        assert.equal(stmts.length + txs.length, 0);
    });

    it('should accept a new statement via the public API and be flushable', async () => {

        // Initialize an empty DB
        const db = new TransactionDB()
        await db.initialize(":memory:");
        
        // Get generic test statement
        const stmt = await statementFactory()
        
        // Insert the statement
        await db.insertStatement(stmt);

        // Check that the transactions have been inserted
        const stmts = await db.getAllStatements();
        const txs = await db.getAllTransactions();

        assert.equal(stmts.length, 1);
        assert.equal(txs.length, stmt.transactions.length);

        // At this point, we should be able to clear the tables
        // and see no remaining values in the DB
        await db.clear();
        assert.equal((await db.getAllStatements()).length, 0);
        assert.equal((await db.getAllTransactions()).length, 0);
    });

    it('should be able to exhibit function chaining for appropriate API methods', async () => {
            // Initialize an empty DB
            const db = new TransactionDB()
            await db.initialize(":memory:");
            
            // Get generic test statement
            const stmt = await statementFactory()
            // Get generic test transaction
            const tx = transactionFactory();
            
            // Insert the statement and the tx a few times
            await db.insertStatement(stmt)
                .then((db) => db.insertTransaction(tx))
                .then((db) => db.insertTransaction(tx));
            
            // Check that the transactions have been inserted
            const stmts = await db.getAllStatements();
            const txs = await db.getAllTransactions();

            assert.equal(stmts.length, 1);
            assert.equal(txs.length, stmt.transactions.length + 2);
    });

    it('should not accept two identical statements', async () => {

        // Initialize an empty DB
        const db = new TransactionDB()
        await db.initialize(":memory:");
        
        // Get generic test statement
        const stmt = await statementFactory()
        
        // Insert the statement
        await db.insertStatement(stmt);
        // Now we should reject the same statement
        assert.rejects(async () => {
            await db.insertStatement(stmt);
        });
    });

    it('should be able to provide txs and stmts', async () => {

        // Initialize an empty DB
        const db = new TransactionDB()
        await db.initialize(":memory:");
        
        // Get generic test statement
        const stmt = await statementFactory()
        
        // Insert the statement
        await db.insertStatement(stmt);

        // Getting a single transaction should match
        assert.deepEqual(await db.getTransaction(1), stmt.transactions[0]);
        // Getting all for this statement should match as well
        assert.deepEqual(await db.getTransactionsForStatement(1), stmt.transactions.sort((a, b) => b.amount - a.amount));
        // Can get one statement
        assert.deepEqual(await db.getStatement(1), stmt)
        // And then all statements
        assert.deepEqual(await db.getAllStatements(), [stmt]);
    });
});