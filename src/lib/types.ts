export interface Config {
	url: string
	nucleo: string
	nomeSecretario: string
	contato: string
	valorReferente: string
	municipio: string
	mes: string
}

export interface Filiado {
	id: string
	nome: string
	valor: string
	comprovante: string
}

export interface StatusEntry {
	nome: string
	status: "pending" | "success" | "error"
	error?: string
}

export interface ProgressUpdate {
	type: "log" | "status" | "done" | "error"
	message?: string
	entry?: StatusEntry
}
