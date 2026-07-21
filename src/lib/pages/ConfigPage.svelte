<script lang="ts">
import type { Config } from "../types"

let {
	config = $bindable({
		url: "",
		nucleo: "",
		nomeSecretario: "",
		contato: "",
		valorReferente: "",
		municipio: "",
		mes: "",
	}),
}: { config: Config } = $props()

function handleOpenForm() {
	if (config.url) {
		window.api.openForm(config.url)
	}
}

let domPath = $state("")
async function handleCaptureDom() {
	try {
		domPath = await window.api.captureFormDom()
	} catch (e: any) {
		domPath = `Erro: ${e.message ?? e}`
	}
}
</script>

<div class="page">
  <h2>Configuração</h2>

  <label>
    URL do Google Forms
    <input type="url" bind:value={config.url} placeholder="https://docs.google.com/forms/d/..." />
  </label>

  <label>
    Núcleo
    <input type="text" bind:value={config.nucleo} placeholder="Ex: UP St C / Bela Vista / República" />
  </label>

  <label>
    Nome do Secretário(a)
    <input type="text" bind:value={config.nomeSecretario} placeholder="Ex: Lucas Almeida" />
  </label>

  <label>
    Contato
    <input type="text" bind:value={config.contato} placeholder="Ex: (88) 997408406" />
  </label>

  <label>
    Valor Referente
    <input type="text" bind:value={config.valorReferente} placeholder="Ex: Contribuição mensal" />
  </label>

  <label>
    Município
    <input type="text" bind:value={config.municipio} placeholder="Ex: São Paulo" />
  </label>

  <label>
    Mês de Referência
    <input type="text" bind:value={config.mes} placeholder="Ex: Maio/26" />
  </label>

  <button onclick={handleOpenForm} disabled={!config.url}>
    Abrir Google Forms para Login
  </button>

  <button class="secondary" onclick={handleCaptureDom}>
    💾 Salvar DOM do Forms
  </button>
  {#if domPath}
    <p class="dom-path">{domPath}</p>
  {/if}
</div>

<style>
  .page {
    padding: 1.5rem;
    max-width: 500px;
  }
  h2 {
    margin-top: 0;
    margin-bottom: 1.5rem;
  }
  label {
    display: block;
    margin-bottom: 1rem;
    font-size: 0.9rem;
    font-weight: 500;
  }
  input {
    display: block;
    width: 100%;
    margin-top: 0.25rem;
    padding: 0.5rem;
    border: 1px solid #555;
    border-radius: 6px;
    background: #1e1e1e;
    color: #fff;
    font-size: 0.9rem;
    box-sizing: border-box;
  }
  input:focus {
    outline: none;
    border-color: #4a9eff;
  }
  button {
    margin-top: 1rem;
    padding: 0.6rem 1.2rem;
    border: none;
    border-radius: 6px;
    background: #4a9eff;
    color: #fff;
    font-size: 0.9rem;
    cursor: pointer;
  }
  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  button:hover:not(:disabled) {
    background: #3a8eef;
  }
  button.secondary {
    background: #555;
    margin-left: 0.5rem;
  }
  button.secondary:hover {
    background: #666;
  }
  .dom-path {
    margin-top: 0.5rem;
    font-size: 0.8rem;
    color: #888;
    word-break: break-all;
  }
</style>
