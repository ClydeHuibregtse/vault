<script lang="ts">

    import { dbClient } from "$lib/model/db.ts";

    // Filepaths of various statements
    interface UploadableStatement {
        file: File,
        date: string,
        txMethod: string
    }

    let uploadText = "No statements to upload...";

    async function upload(upStmts: UploadableStatement[]) {
        console.log(`Client wants to upload ${upStmts.length} statements`);
        console.log(upStmts);
        let statementPromises = [];
        for (const stmt of upStmts) {
            console.log(stmt.date);
            let promise = dbClient.uploadStatement(
                stmt.file,
                new Date(stmt.date),
                stmt.txMethod
            )
            statementPromises.push(promise);
        }
        Promise.all(statementPromises)
            .then(() => {
                console.log("All statements uploaded")
                // Flush the current set of statements
                stmtsToUpload = [];
                uploadText = `Uploaded ${upStmts.length} statements. Select more!`
            })
            .catch(error => {
                console.error("At least one statement failed", error)
            })
        
    }

    let fileSelector: HTMLInputElement;
    let stmtsToUpload: UploadableStatement[] = [];
    function handleInput() {
        if (!fileSelector || fileSelector.files == null) {
            return
        }
        // Create collection of UploadableStatements
        // that can be mutated via the UI before upload
        stmtsToUpload = Array.from(fileSelector.files).map(stmtFile => ({
            file: stmtFile,
            txMethod: "Apple CC",
            date: "",
        }));
        uploadText = "No statements to upload..."
      }

</script>

<div id="uploader">
    <div class="button file-selector-container">
        <div class="file-selector-button-label">
            Select Statements
        </div>
        <input
            class="file-selector"
            bind:this={fileSelector}
            multiple
            type="file"
            accept=".csv"
            on:change={handleInput}
        />
    </div>
    <table class="statement-upload-table">
        {#each stmtsToUpload as stmt, index (stmt)}
            <tr>
                <td><p>{stmt.file.name}</p></td>
                <td><input type="text" bind:value={stmt.txMethod}></td>
                <td><input type="month" bind:value={stmt.date}></td>
                <td><button class="button remove-button">&#x2716</button></td>
            </tr>
        {/each}
        {#if stmtsToUpload.length == 0}
            <tr><td>{uploadText}</td></tr>
        {/if}
    </table>
    <div id="upload-button">
        <div></div>
        <button
            disabled={!(stmtsToUpload.length > 0)}
            class="button"
            on:click={() => upload(stmtsToUpload)}
        >
            Upload
        </button>
        <div></div>
    </div>
</div>

<style>
    #uploader {
        padding: 5px;
        display: grid;
        grid-template-columns: 1fr;
        grid-template-rows: 1fr 5fr 1fr;
        gap: 5px;

    }
    .button {
        display: inline-block;
        font-size: 16px;
        font-weight: bold;
        text-align: center;
        text-decoration: none;
        cursor: pointer;
        border: 2px solid #10344d;
        background-color: #4fa3db;
        color: #10344d;
        border-radius: 5px;
        transition: background-color 0.3s ease;
    }
    .button:hover {
        background-color: #3498db;
        color: white;
    }
    .button:disabled {
        color: gray;
    }
    .remove-button {
        color: red;

        text-align: center;
    }
    #upload-button {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        padding: 5px;
    }
    .file-selector {
        position: absolute;
        top: 0;
        left: 0;
        font-size: 100px;
        cursor: pointer;
        opacity: 0;
    }
    .file-selector-container {
        position: relative;
        overflow: hidden;
        display: inline-block;
    }
    .file-selector-button-label {
        margin-top: 10px
    }
    .statement-upload-table {
        width: 100%;
        height: 100%;
        border: 2px solid #3498db;
        overflow: scroll;
    }
    td {
        text-align: center;
    }
</style>