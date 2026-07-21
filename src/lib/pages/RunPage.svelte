<script lang="ts">
  import type { Config, Filiado, StatusEntry } from '../types'
  import LogViewer from '../components/LogViewer.svelte'

  let {
    config,
    filiados,
  }: {
    config: Config
    filiados: Filiado[]
  } = $props()

  let running = $state(false)
  let entries = $state<StatusEntry[]>([])
  let logs = $state<string[]>([])

  async function handleStart() {
    if (running || filiados.length === 0) return
    running = true
    entries = filiados.map((f) => ({ nome: f.nome, status: 'pending' }))
    logs = ['Iniciando automação...']

    const unsubscribe = window.api.onFormProgress((update: any) => {
      if (update.type === 'log' && update.message) {
        logs = [...logs, update.message]
      }
      if (update.type === 'status' && update.entry) {
        entries = entries.map((e) =>
          e.nome === update.entry.nome ? update.entry : e,
        )
      }
      if (update.type === 'done' && update.message) {
        logs = [...logs, update.message]
      }
      if (update.type === 'error' && update.message) {
        logs = [...logs, update.message]
      }
    })

    try {
      await window.api.startAutomation(
        { ...config },
        filiados.map((f) => ({ ...f })),
      )
      logs = [...logs, 'Automação concluída com sucesso!']
    } catch (e: any) {
      logs = [...logs, `Erro: ${e.message ?? String(e)}`]
    } finally {
      running = false
      unsubscribe()
    }
  }

  function handleCancel() {
    window.api.cancelAutomation()
    logs = [...logs, 'Cancelando...']
  }

  function handleOpenForm() {
    if (config.url) window.api.openForm(config.url)
  }
</script>

<div class="page">
  <h2>Execução</h2>

  {#if !config.url}
    <div class="alert">Configure a URL do formulário na aba "Configuração" primeiro.</div>
  {:else if filiados.length === 0}
    <div class="alert">Adicione filiados na aba "Filiados" primeiro.</div>
  {:else}
    <div class="info">
      <p><strong>Formulário:</strong> {config.url}</p>
      <p><strong>Filiados:</strong> {filiados.length}</p>
      <p><strong>Núcleo:</strong> {config.nucleo} | <strong>Município:</strong> {config.municipio}</p>
      <p><strong>Secretário:</strong> {config.nomeSecretario} | <strong>Mês:</strong> {config.mes}</p>
    </div>

    {#if !running}
      <div class="actions">
        <button onclick={handleOpenForm}>Abrir Google Forms (login)</button>
        <button class="primary" onclick={handleStart}>▶ Iniciar Automação</button>
      </div>
    {:else}
      <div class="actions">
        <button class="danger" onclick={handleCancel}>■ Cancelar</button>
      </div>
    {/if}

    <div class="log-container">
      <LogViewer bind:entries bind:logs bind:running />
    </div>
  {/if}
</div>

<style>
  .page {
    padding: 1.5rem;
  }
  h2 {
    margin-top: 0;
    margin-bottom: 1rem;
  }
  .alert {
    background: #332;
    border: 1px solid #aa0;
    border-radius: 8px;
    padding: 1rem;
    color: #dd0;
  }
  .info {
    background: #1e1e1e;
    border-radius: 8px;
    padding: 0.75rem 1rem;
    margin-bottom: 1rem;
    font-size: 0.85rem;
    line-height: 1.6;
  }
  .info p {
    margin: 0.25rem 0;
  }
  .actions {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }
  button {
    padding: 0.6rem 1.2rem;
    border: none;
    border-radius: 6px;
    font-size: 0.9rem;
    cursor: pointer;
    background: #555;
    color: #fff;
  }
  button.primary {
    background: #2a6;
  }
  button.danger {
    background: #e55;
  }
  button:hover:not(:disabled) {
    opacity: 0.85;
  }
  .log-container {
    height: 350px;
  }
</style>
