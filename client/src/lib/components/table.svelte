<script lang="ts">

    import { getTransactions, getStatements, Transaction, Statement} from "$lib/model/db.ts";
    import { onMount } from "svelte";
    import SvelteTable from "svelte-table";
    import type { TableColumn } from "svelte-table";

    function setupColumns(tx: Transaction): TableColumn<Transaction>[] {
        let columns: TableColumn<Transaction>[] = [];
        Object.keys(tx).forEach((key: string) => {
            columns.push({
                key: key,
                title: key,
                value: (v: Transaction) => (v as any)[key],
                sortable: true
            })
        });
        return columns
    }
    
    async function initialize() : Promise<[TableColumn<Transaction>[], Transaction[]]> {
        let transactions = await getTransactions();
        return new Promise((res, rej) => {
            if (transactions.length == 0) {
                rej("No transactions")
            }
            const columns = setupColumns(transactions[0]);
            res([columns, transactions])
        })
    }

</script>
{#await initialize()}
    <p>Loading...</p>
{:then data}
    <SvelteTable columns="{data[0]}" rows="{data[1]}"></SvelteTable>
{:catch err}
    {err}
{/await}