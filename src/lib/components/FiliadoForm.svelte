<script lang="ts">
import type { Filiado } from "../types"

let {
	filiado: initial,
	onsave,
	oncancel,
}: {
	filiado?: Filiado
	onsave: (f: Filiado) => void
	oncancel: () => void
} = $props()

let nome = $state(initial?.nome ?? "")
let valor = $state(initial?.valor ?? "")
let comprovante = $state(initial?.comprovante ?? "")
let editingId = $state(initial?.id)

function _handleSave() {
	if (!nome.trim() || !valor.trim()) return
	onsave({
		id: editingId ?? crypto.randomUUID(),
		nome: nome.trim(),
		valor: valor.trim(),
		comprovante: comprovante.trim(),
	})
}

function _handleOverlayClick(e: MouseEvent) {
	if (e.target === e.currentTarget) oncancel()
}

function _handleKeydown(e: KeyboardEvent) {
	if (e.key === "Escape") oncancel()
}

async function _handlePickFile() {
	const name = await window.api.importComprovante()
	if (name) comprovante = name
}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions a11y_click_events_have_key_events -->
<div class="overlay" onclick={handleOverlayClick} onkeydown={handleKeydown}>
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
  <div class="modal" onclick={(e) => e.stopPropagation()}>
    <h3>{initial ? 'Editar' : 'Adicionar'} Filiado</h3>
    <label>
      Nome
      <input type="text" bind:value={nome} placeholder="Nome completo" />
    </label>
    <label>
      Valor
      <input type="text" bind:value={valor} placeholder="Ex: 50,00" />
    </label>
    <label>
      Comprovante
      <div class="file-picker">
        <input type="text" bind:value={comprovante} placeholder="Caminho do arquivo" readonly />
        <button class="inline" onclick={handlePickFile}>Selecionar</button>
      </div>
    </label>
    <div class="actions">
      <button class="secondary" onclick={oncancel}>Cancelar</button>
      <button onclick={handleSave} disabled={!nome.trim() || !valor.trim()}>
        Salvar
      </button>
    </div>
  </div>
</div>

<style>
  .overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
  }
  .modal {
    background: #2a2a2a;
    border-radius: 10px;
    padding: 1.5rem;
    min-width: 360px;
  }
  h3 {
    margin: 0 0 1rem;
  }
  label {
    display: block;
    margin-bottom: 0.75rem;
    font-size: 0.85rem;
  }
  input {
    display: block;
    width: 100%;
    margin-top: 0.25rem;
    padding: 0.45rem;
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
  .actions {
    display: flex;
    gap: 0.5rem;
    justify-content: flex-end;
    margin-top: 1rem;
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
  button.secondary {
    background: #555;
  }
  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  button.inline {
    padding: 0.35rem 0.7rem;
    font-size: 0.8rem;
    flex-shrink: 0;
  }
  button:hover:not(:disabled) {
    opacity: 0.85;
  }
  .file-picker {
    display: flex;
    gap: 0.5rem;
    margin-top: 0.25rem;
  }
  .file-picker input {
    margin-top: 0;
    flex: 1;
    cursor: default;
  }
</style>
