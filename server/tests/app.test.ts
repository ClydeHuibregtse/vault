import path from 'path';
import mocha from 'mocha';
import chai from 'chai';
import chaiHttp from 'chai-http';
import { makeApp } from '../app.ts';
import { TEST_STATEMENTS_DIR, statementFactory } from './statements.test.ts';
import { Transaction } from '../lib/transactions.ts';

const expect = chai.expect;
chai.use(chaiHttp);

mocha.describe('Express App API', async () => {
    it('should respond with status 200 on GET request to /', (done) => {
        const app = makeApp(undefined, true);

        chai.request(app)
            .get('/')
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res).to.be.html;
                expect(res.text).to.be.a('string');
                expect(res.text).to.equal("Hello World!");
                done();
            });
    });
    it('should be able to receive and regurgitate statements', async () => {
        const exampleStmt = await statementFactory();
        const app = makeApp(undefined, true)
        // Without providing a file, this should fail with bad request
        const nofile = await chai.request(app)
                    .post('/statements/upload');
        expect(nofile).to.have.status(400);
        expect(nofile.body).to.equal("No file uploaded.");

        // With a file, we should now get hit because our
        // query params are not set
        const noparams = await chai.request(app)
                .post('/statements/upload')
                .attach("file", path.join(TEST_STATEMENTS_DIR, "apple.csv"))
        expect(noparams).to.have.status(400);
        expect(noparams.body).to.equal("Bad request: TX Method not found in query");

        // With a file and params, we should be golden
        const uploadSuccess = await chai.request(app)
            .post('/statements/upload')
            .field("txMethod", exampleStmt.transactionMethod as string)
            .attach("file", path.join(TEST_STATEMENTS_DIR, "apple.csv"))
        
        expect(uploadSuccess).to.have.status(200);
        expect(uploadSuccess).to.be.json;
        expect(uploadSuccess.body.numberTx).to.equal(exampleStmt.transactions.length);

        // Now, we should be able to look up our statements and txs via GET
        const getStatements = await chai.request(app)
            .get('/statements')
        expect(getStatements).to.have.status(200);
        expect(getStatements.body.length).to.equal(1);

        const getTransactions = await chai.request(app)
            .get('/transactions')
        expect(getTransactions.body.length).to.equal(exampleStmt.transactions.length)
        const txs = getTransactions.body.map((v) => Transaction.fromRecord(v));
        expect(txs).to.deep.equal(exampleStmt.transactions.sort((a, b) => b.amount - a.amount));

    });
    it('should be able to download raw CSVs',  async () => {
        // Insert a generic statement. Let's see if we can download
        const exampleStmt = await statementFactory();
        const app = makeApp(undefined, true);
        const uploadSuccess = await chai.request(app)
            .post('/statements/upload')
            .field("txMethod", exampleStmt.transactionMethod as string)
            .attach("file", path.join(TEST_STATEMENTS_DIR, "apple.csv"))
        
        expect(uploadSuccess).to.have.status(200);
        expect(uploadSuccess).to.be.json;
        expect(uploadSuccess.body.numberTx).to.equal(exampleStmt.transactions.length);

        const download = await chai.request(app)
            .get(`/statements/1/download`)

        expect(download).to.have.status(200);
        expect(download).to.have.header('content-type', 'text/csv; charset=UTF-8');
    });

});