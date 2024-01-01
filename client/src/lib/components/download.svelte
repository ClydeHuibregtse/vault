<script lang="ts">
    import { dbClient, statementStore } from "$lib/model/db.ts";
    import type { Statement } from "$lib/model/db.ts";

    let statements: Statement[];
    $: statements = $statementStore;

</script>

<div id="downloader">
    <table class="statement-download-table">
        {#each statements as stmt, index (stmt)}
            <tr>
                <td><a href={dbClient.downloadStatementLink(stmt.id)}>
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