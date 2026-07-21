import type { Config, Filiado, ProgressUpdate } from './types'

declare global {
  interface Window {
    api: {
      getConfig: () => Promise<Config>
      saveConfig: (config: Config) => Promise<void>
      getFiliados: () => Promise<Filiado[]>
      saveFiliados: (filiados: Filiado[]) => Promise<void>
      importComprovante: () => Promise<string | null>
      openForm: (url: string) => Promise<void>
      captureFormDom: () => Promise<string>
      startAutomation: (config: Config, filiados: Filiado[]) => Promise<void>
      cancelAutomation: () => Promise<void>
      onFormProgress: (callback: (update: ProgressUpdate) => void) => () => void
    }
  }
}
