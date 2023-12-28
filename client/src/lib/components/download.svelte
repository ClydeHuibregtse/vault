<script lang="ts">
    import {onMount} from "svelte";
    import { Statement, getStatements, downloadStatementLink } from "$lib/model/db.ts";

    let remoteStatements: Statement[] = [];

    async function refreshRemoteStatements() {
        remoteStatements = await getStatements();
    }


    onMount(async () => {
        await refreshRemoteStatements();
        console.log("STATE<ENTS", remoteStatements);
    })
    

</script>

<div id="downloader">
    <table class="statement-download-table">
        {#each remoteStatements as stmt, index (stmt)}
            <tr>
                <td><a href={downloadStatementLink(stmt.id)}>
                    {stmt.pathToCSV}
                </a></td>
            </tr>
        {/each}
    </table>
</div>

<style>
    #downloader {
        padding: 5px;
        display: grid;
        grid-template-columns: 1fr;
        grid-template-rows: 1fr 5fr 1fr;
        gap: 5px;
    }
    .statement-download-table {

    }
</style>