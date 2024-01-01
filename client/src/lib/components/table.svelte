<script lang="ts">
    import { statementStore } from "$lib/model/db.ts";
    import type { Statement, Transaction } from "$lib/model/db.ts";
    import SvelteTable from "svelte-table";
    import type { TableColumn } from "svelte-table";

    // Read from the statement store
    let statements: Statement[];
    $: statements = $statementStore;
    let transactions: Transaction[];
    $: transactions = allTransactions(statements);

    function allTransactions(stmts: Statement[]): Transaction[] {
        let txs = stmts.map((s) => s.transactions);
        return txs.flat();
    }

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


</script>
{#if transactions.length > 0}
    <SvelteTable columns="{setupColumns(transactions[0])}" rows="{transactions}"></SvelteTable>
{:else}
    <p>Loading...</p>
{/if}