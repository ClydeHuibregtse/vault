<script lang="ts">

    import {onMount} from "svelte";

    let errorMessage = "";
    let isVisible = false;
  
    export function showError(message: string) {
      errorMessage = message;
      isVisible = true;
    }
  
    function closeBanner() {
      isVisible = false;
    }
    onMount(() => {
        // Attach the global error handler
        window.onerror = (event) => {showError(event as string)}
    })

  </script>
  
  {#if isVisible}
    <div class="error-banner">
      <p>{errorMessage}</p>
      <button on:click={closeBanner}>Close</button>
    </div>
  {/if}
  
  <style>
    .error-banner {
      background-color: #f44336;
      color: #fff;
      padding: 15px;
      margin: 10px 0;
      border-radius: 5px;
    }
  
    button {
      background-color: #fff;
      color: #f44336;
      border: none;
      padding: 5px 10px;
      cursor: pointer;
    }
</style>
