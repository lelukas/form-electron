import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { app } from "electron"
import type { Config, Filiado } from "../src/lib/types"

const DATA_DIR = join(app.getPath("userData"), "data")
const CONFIG_PATH = join(DATA_DIR, "config.json")
const FILIADOS_PATH = join(DATA_DIR, "filiados.json")

function ensureDir() {
	if (!existsSync(DATA_DIR)) {
		mkdirSync(DATA_DIR, { recursive: true })
	}
}

const DEFAULT_CONFIG: Config = {
	url: "",
	nucleo: "",
	nomeSecretario: "",
	contato: "",
	valorReferente: "",
	municipio: "",
	mes: "",
}

export function getConfig(): Config {
	ensureDir()
	try {
		const raw = readFileSync(CONFIG_PATH, "utf-8")
		return { ...DEFAULT_CONFIG, ...JSON.parse(raw) }
	} catch {
		return { ...DEFAULT_CONFIG }
	}
}

export function saveConfig(config: Config): void {
	ensureDir()
	writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), "utf-8")
}

export function getFiliados(): Filiado[] {
	ensureDir()
	try {
		const raw = readFileSync(FILIADOS_PATH, "utf-8")
		return JSON.parse(raw)
	} catch {
		return []
	}
}

export function saveFiliados(filiados: Filiado[]): void {
	ensureDir()
	writeFileSync(FILIADOS_PATH, JSON.stringify(filiados, null, 2), "utf-8")
}

export function getUploadsDir(): string {
	const dir = join(DATA_DIR, "uploads")
	if (!existsSync(dir)) {
		mkdirSync(dir, { recursive: true })
	}
	return dir
}
