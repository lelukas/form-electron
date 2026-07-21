<script lang="ts">
  import type { Filiado } from '../types'
  import FiliadoForm from '../components/FiliadoForm.svelte'

  let {
    filiados = $bindable([]),
  }: { filiados: Filiado[] } = $props()

  let editingFiliado = $state<Filiado | undefined>(undefined)
  let adding = $state(false)

  function handleSave(f: Filiado) {
    if (editingFiliado) {
      const idx = filiados.findIndex((item) => item.id === editingFiliado!.id)
      if (idx >= 0) filiados[idx] = f
    } else {
      filiados.push(f)
    }
    filiados = filiados
    editingFiliado = undefined
    adding = false
  }

  function handleDelete(id: string) {
    filiados = filiados.filter((f) => f.id !== id)
  }

  function handleEdit(f: Filiado) {
    editingFiliado = f
  }

  function handleCancel() {
    editingFiliado = undefined
    adding = false
  }
</script>

<div class="page">
  <div class="header">
    <h2>Filiados ({filiados.length})</h2>
    <button onclick={() => (adding = true)} disabled={adding}>+ Adicionar</button>
  </div>

  {#if filiados.length === 0}
    <p class="empty">Nenhum filiado cadastrado. Clique em "Adicionar" para começar.</p>
  {:else}
    <div class="list">
      {#each filiados as f (f.id)}
        <div class="item">
          <div class="info">
            <span class="name">{f.nome}</span>
            <span class="valor">R$ {f.valor}</span>
            {#if f.comprovante}
              <span class="file">{f.comprovante}</span>
            {/if}
          </div>
          <div class="actions">
            <button class="small" onclick={() => handleEdit(f)}>Editar</button>
            <button class="small danger" onclick={() => handleDelete(f.id)}>Remover</button>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

{#if adding || editingFiliado}
  <FiliadoForm
    filiado={editingFiliado}
    onsave={handleSave}
    oncancel={handleCancel}
  />
{/if}

<style>
  .page {
    padding: 1.5rem;
  }
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }
  h2 {
    margin: 0;
  }
  .empty {
    color: #888;
    text-align: center;
    padding: 2rem;
  }
  .list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #1e1e1e;
    padding: 0.75rem 1rem;
    border-radius: 8px;
  }
  .info {
    display: flex;
    gap: 1rem;
    align-items: center;
  }
  .name {
    font-weight: 500;
  }
  .valor {
    color: #4a9eff;
    font-family: monospace;
  }
  .file {
    color: #888;
    font-size: 0.8rem;
  }
  .actions {
    display: flex;
    gap: 0.35rem;
  }
  button {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 6px;
    font-size: 0.85rem;
    cursor: pointer;
    background: #4a9eff;
    color: #fff;
  }
  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  button:hover:not(:disabled) {
    opacity: 0.85;
  }
  .small {
    padding: 0.35rem 0.7rem;
    font-size: 0.8rem;
  }
  .danger {
    background: #e55;
  }
</style>
