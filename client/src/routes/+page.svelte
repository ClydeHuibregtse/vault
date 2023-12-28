<script lang="ts">
    import ErrorBanner from "$lib/components/error.svelte"
    import TransactionTable from "$lib/components/table.svelte";
    import StatementUpload from "$lib/components/upload.svelte";
    import StatementDownload from "$lib/components/download.svelte";

    let eBanner: ErrorBanner;

</script>

<div>
    <ErrorBanner bind:this={eBanner}></ErrorBanner>
    <div id="content">
        <div id="tx-table">
            <TransactionTable></TransactionTable>
        </div>
        <div id="sidebar">
            <div id="stmt-upload">
                <StatementUpload/>
            </div>
            <div id="stmt-download">
                <StatementDownload/>
            </div>
        </div>
        <div id="plots">
            Plots go here
        </div>
    </div>
</div>

<style>
    #content {
        display: grid;
        grid-template-rows: 1fr 1fr;
        grid-template-columns: 3fr 1fr;
        gap: 10px;
    }
    #sidebar {
        display: grid;
        grid-template-rows: 1fr 1fr;
        grid-template-columns: 1fr;

    }
    #tx-table {
        background-color: rgb(168, 168, 251);
        max-height: 50vh;
        overflow: scroll;
    }
    #stmt-upload {
        max-height: 50vh;
        background-color: aqua;
    }
    #stmt-download {
        max-height: 50vh;
        background-color: rgb(234, 167, 255);
    }
    #plots {
        max-height: 50vh;
    }
</style>