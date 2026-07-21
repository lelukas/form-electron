<script lang="ts">
import ConfigPage from "./lib/pages/ConfigPage.svelte"
import FiliadosPage from "./lib/pages/FiliadosPage.svelte"
import RunPage from "./lib/pages/RunPage.svelte"
import type { Config, Filiado } from "./lib/types"

let currentTab = $state<"config" | "filiados" | "run">("config")
let config = $state<Config>({
	url: "",
	nucleo: "",
	nomeSecretario: "",
	contato: "",
	valorReferente: "",
	municipio: "",
	mes: "",
})
let filiados = $state<Filiado[]>([])
let loaded = $state(false)

$effect(() => {
	async function load() {
		const [cfg, fil] = await Promise.all([window.api.getConfig(), window.api.getFiliados()])
		config = cfg
		filiados = fil
		loaded = true
	}
	load()
})

$effect(() => {
	if (!loaded) return
	const { url, nucleo, nomeSecretario, contato, valorReferente, municipio, mes } = config
	window.api.saveConfig({ url, nucleo, nomeSecretario, contato, valorReferente, municipio, mes })
})

$effect(() => {
	if (!loaded) return
	const snapshot = filiados.map((f) => ({ ...f }))
	window.api.saveFiliados(snapshot)
})

const tabs = [
	{ id: "config" as const, label: "Configuração" },
	{ id: "filiados" as const, label: "Filiados" },
	{ id: "run" as const, label: "Execução" },
]
</script>

<nav>
  {#each tabs as tab}
    <button
      class="tab"
      class:active={currentTab === tab.id}
      onclick={() => (currentTab = tab.id)}
    >
      {tab.label}
    </button>
  {/each}
</nav>

<main>
  {#if !loaded}
    <p class="loading">Carregando...</p>
  {:else if currentTab === 'config'}
    <ConfigPage bind:config />
  {:else if currentTab === 'filiados'}
    <FiliadosPage bind:filiados />
  {:else if currentTab === 'run'}
    <RunPage {config} {filiados} />
  {/if}
</main>

<style>
  nav {
    display: flex;
    gap: 0;
    background: #1a1a1a;
    border-bottom: 1px solid #333;
  }
  .tab {
    padding: 0.75rem 1.5rem;
    border: none;
    background: transparent;
    color: #888;
    font-size: 0.9rem;
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
  }
  .tab:hover {
    background: #2a2a2a;
    color: #ccc;
  }
  .tab.active {
    color: #fff;
    background: #2a2a2a;
    border-bottom: 2px solid #4a9eff;
  }
  main {
    flex: 1;
    overflow-y: auto;
  }
  .loading {
    text-align: center;
    padding: 2rem;
    color: #888;
  }
</style>
