<script lang="ts">
  import type { StatusEntry } from '../types'

  let {
    entries = $bindable([]),
    logs = $bindable([]),
    running = $bindable(false),
  }: {
    entries: StatusEntry[]
    logs: string[]
    running: boolean
  } = $props()

  let logEl: HTMLDivElement

  $effect(() => {
    if (logEl) {
      logEl.scrollTop = logEl.scrollHeight
    }
  })
</script>

<div class="log-viewer">
  <div class="status-list">
    {#each entries as entry (entry.nome)}
      <div class="entry {entry.status}">
        <span class="icon">
          {#if entry.status === 'pending'}⏳
          {:else if entry.status === 'success'}✅
          {:else}❌
          {/if}
        </span>
        <span class="nome">{entry.nome}</span>
        {#if entry.error}
          <span class="error">{entry.error}</span>
        {/if}
      </div>
    {/each}
  </div>
  <div class="logs" bind:this={logEl}>
    {#each logs as log}
      <div class="log-line">{log}</div>
    {/each}
  </div>
</div>

<style>
  .log-viewer {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    height: 100%;
  }
  .status-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
  }
  .entry {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.3rem 0.6rem;
    border-radius: 6px;
    font-size: 0.8rem;
    background: #1e1e1e;
  }
  .entry.success {
    border: 1px solid #2a6;
  }
  .entry.error {
    border: 1px solid #e55;
  }
  .entry.pending {
    border: 1px solid #aa0;
  }
  .icon {
    font-size: 0.9rem;
  }
  .nome {
    font-weight: 500;
  }
  .error {
    color: #e55;
    font-size: 0.75rem;
  }
  .logs {
    flex: 1;
    overflow-y: auto;
    background: #111;
    border-radius: 6px;
    padding: 0.5rem;
    font-family: monospace;
    font-size: 0.8rem;
    max-height: 200px;
  }
  .log-line {
    padding: 0.1rem 0;
    color: #aaa;
  }
</style>
