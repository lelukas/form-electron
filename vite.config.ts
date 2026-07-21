import path from "node:path"
import { svelte } from "@sveltejs/vite-plugin-svelte"
import { defineConfig } from "vite"
import electron from "vite-plugin-electron/simple"

export default defineConfig({
	plugins: [
		svelte(),
		electron({
			main: {
				entry: "electron/main.ts",
			},
			preload: {
				input: path.join(__dirname, "electron/preload.ts"),
			},
			renderer: process.env.NODE_ENV === "test" ? undefined : {},
		}),
	],
})
