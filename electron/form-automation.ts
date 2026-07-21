import type { Config, Filiado } from '../src/lib/types'
import { getUploadsDir } from './store'
import path from 'node:path'
import { appendFileSync, existsSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

export type OnProgress = (update: { type: 'log' | 'status' | 'done' | 'error'; message?: string; entry?: { nome: string; status: string; error?: string } }) => void

const q = JSON.stringify

const _dirname = path.dirname(fileURLToPath(import.meta.url))
const LOG_DIR = path.resolve(_dirname, '..', 'logs')
function logFile(level: string, msg: string) {
  try {
    if (!existsSync(LOG_DIR)) mkdirSync(LOG_DIR, { recursive: true })
    const ts = new Date().toISOString().replace('T', ' ').slice(0, 19)
    appendFileSync(path.join(LOG_DIR, 'automation.log'), `[${ts}] ${level}: ${msg}\n`)
  } catch {}
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

async function waitForElement(eJS: ExecuteJS, selector: string, timeout = 15000): Promise<void> {
  const start = Date.now()
  while (Date.now() - start < timeout) {
    const found = await eJS(`!!document.querySelector(${q(selector)})`)
    if (found) return
    await sleep(300)
  }
  throw new Error(`Element not found: ${selector}`)
}

// async function waitForXPath(eJS: ExecuteJS, xpath: string, timeout = 15000): Promise<void> {
//   const start = Date.now()
//   while (Date.now() - start < timeout) {
//     const found = await eJS(
//       `!!document.evaluate(${q(xpath)}, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue`,
//     )
//     if (found) return
//     await sleep(300)
//   }
//   throw new Error(`Element not found (xpath): ${xpath}`)
// }

function clickSim(expr: string): string {
  return `(function(){try{var el=${expr};if(!el)return false;el.scrollIntoView({block:'center'});var r=el.getBoundingClientRect();var x=r.left+r.width/2;var y=r.top+r.height/2;var evts=['mousedown','mouseup','click'];for(var i=0;i<evts.length;i++){el.dispatchEvent(new MouseEvent(evts[i],{bubbles:true,cancelable:true,clientX:x,clientY:y,button:0}))}return true}catch(e){return false}})()`
}

function findXPath(xp: string): string {
  return `document.evaluate(${q(xp)},document,null,XPathResult.FIRST_ORDERED_NODE_TYPE,null).singleNodeValue`
}

async function selectInSelectBlock(eJS: ExecuteJS, label: string, value: string, onProgress: OnProgress): Promise<void> {
  const baseXPath = `//span[b/i[text()=${q(label)}]]/../../../..//*[@role="listbox"]`
  const clickXPath = baseXPath + `/*[@role="presentation"]`
  const optionsXPath = clickXPath + `/following-sibling::div[1]`

  if (!await eJS(`!!${findXPath(clickXPath)}`)) {
    throw new Error(`Select block not found for label: ${label}`)
  }

  if (!await eJS(clickSim(findXPath(clickXPath)))) {
    throw new Error(`Failed to click select for label: ${label}`)
  }

  const dataValue = q(`div[data-value="${value}"]`)

  const start = Date.now()
  while (Date.now() - start < 8000) {
    const ok = !!(await eJS(
      `(function(){var c=${findXPath(optionsXPath)};if(!c)return false;var w=c.querySelector(${dataValue});if(!w)return false;return ${clickSim('w')}})()`,
    ))
    if (ok) { onProgress({ type: 'log', message: `✅ Select "${label}" → ${value}` }); return }
    await sleep(300)
  }
  throw new Error(`Option not found for value: ${value}`)
}

async function selectInCheckboxBlock(eJS: ExecuteJS, label: string, value: string, onProgress: OnProgress): Promise<void> {
  const containerXpath = `//span[b/i[text()=${q(label)}]]/../../../..`
  const clicked = await eJS(
    `(function(){var c=${findXPath(containerXpath)};if(!c)return false;var w=c.querySelector('div[data-answer-value=${q(value)}]');if(!w)return false;return ${clickSim('w')}})()`,
  )
  if (!clicked) throw new Error(`Checkbox item not found: ${value}`)
  onProgress({ type: 'log', message: `✅ Checkbox "${value}" marcado` })
}

async function fillInputs(eJS: ExecuteJS, inputs: { field: string; value: string }[], onProgress: OnProgress): Promise<void> {
  for (let i = 0; i < inputs.length; i++) {
    const { field, value } = inputs[i]
    await eJS(
      `(function(){var els=document.querySelectorAll('input.whsOnd.zHQkBf');if(els[${i}]){var el=els[${i}];el.value='';el.focus();var s=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value');if(s&&s.set){s.set.call(el,${q(value)});el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}))}}})()`,
    )
    onProgress({ type: 'log', message: `✅ Input ${field} preenchido` })
  }
}

async function clickRadioByText(eJS: ExecuteJS, text: string, onProgress: OnProgress): Promise<void> {
  const radioXPath = `//*[text()=${q(text)}]`
  const clicked = await eJS(clickSim(findXPath(radioXPath)))
  if (!clicked) throw new Error(`Radio not found: ${text}`)
  onProgress({ type: 'log', message: `✅ Radio "${text}" clicado` })
}

async function clearChecked(eJS: ExecuteJS, onProgress: OnProgress): Promise<void> {
  await eJS(`document.querySelectorAll('div[aria-checked="true"]').forEach(function(el){el.click()})`)
  onProgress({ type: 'log', message: '✅ Checkboxes limpos' })
}

async function removeFile(eJS: ExecuteJS, onProgress: OnProgress): Promise<void> {
  const xpath = `//div[@aria-label="Remover arquivo"]`
  await eJS(clickSim(findXPath(xpath)))
  onProgress({ type: 'log', message: '✅ Arquivo anterior removido' })
}

async function uploadFile(
  eJS: ExecuteJS,
  filePath: string,
  setInputFiles: (selector: string, files: string[]) => Promise<void>,
  onProgress: OnProgress,
): Promise<void> {
  onProgress({ type: 'log', message: `⏳ Upload: ${filePath}...` })

  await eJS(clickSim('document.querySelector(\'div[aria-label="Adicionar arquivo"]\')'))
  await sleep(3000)

  await setInputFiles('', [filePath])
  await sleep(500)
  onProgress({ type: 'log', message: `✅ Upload: ${filePath}` })
}

function parseValor(valor: string): string {
  if (valor.includes(',')) {
    const split = valor.split(',')
    if (split[1].length === 0) return `${split[0]},00`
    if (split[1].length === 1) return `${split[0]},${split[1]}0`
    return valor
  }
  return `${valor},00`
}

type ExecuteJS = (script: string) => Promise<unknown>
type SetInputFiles = (selector: string, files: string[]) => Promise<void>

function createEJS(wc: any, cancelFlag: { current: boolean }): ExecuteJS {
  return async (script: string) => {
    if (cancelFlag.current) throw new Error('Automação cancelada pelo usuário')
    const wrapped = `try{${script}}catch(e){'__JS_ERR__'+e.message}`
    const result = await wc.executeJavaScript(wrapped)
    if (typeof result === 'string' && result.startsWith('__JS_ERR__')) {
      throw new Error(result.slice(10))
    }
    return result
  }
}

function createSetInputFiles(wc: any): SetInputFiles {
  return async (_selector: string, files: string[]) => {
    const resolvedFiles = files.map((f) => {
      if (path.isAbsolute(f)) return f
      return path.resolve(getUploadsDir(), f)
    })

    await wc.executeJavaScript(`document.querySelector('div[aria-label="Adicionar arquivo"]')?.click()`)

    const dbg = wc.debugger
    await dbg.attach('1.3')
    try {
      const { result } = await dbg.sendCommand('Runtime.evaluate', {
        expression: `(function(){
          return new Promise(function(resolve) {
            (function check() {
              var f = document.querySelector('iframe[allow*="camera"]');
              if (!f) { setTimeout(check, 200); return; }
              var d = f.contentDocument || f.contentWindow.document;
              if (!d || !d.body) { setTimeout(check, 200); return; }
              var el = d.querySelector('input[type="file"]');
              if (el) { resolve(el); return; }
              setTimeout(check, 200);
            })();
          });
        })()`,
        awaitPromise: true,
        timeout: 20000,
      })

      if (!result?.objectId) throw new Error('input[type=file] nao encontrado no picker')

      await dbg.sendCommand('DOM.setFileInputFiles', {
        objectId: result.objectId,
        files: resolvedFiles,
      })

      await sleep(2000)

      await dbg.sendCommand('Runtime.evaluate', {
        expression: `(function(){
          var iframes = document.querySelectorAll('iframe[allow*="camera"]');
          for (var i = 0; i < iframes.length; i++) {
            try {
              var d = iframes[i].contentDocument || iframes[i].contentWindow.document;
              if (!d) continue;
              var path = d.querySelector('path[d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"]');
              if (!path) continue;
              var btn = path.closest('button');
              if (btn) btn.click();
            } catch(e) {}
          }
        })()`,
      })


      logFile('INFO', 'Arquivo enviado: ' + resolvedFiles[0])
    } finally {
      await dbg.detach()
    }
  }
}

export async function runAutomation(
  config: Config,
  filiados: Filiado[],
  wc: any,
  cancelFlag: { current: boolean },
  onProgress: OnProgress,
): Promise<void> {
  const eJS = createEJS(wc, cancelFlag)
  const setInputFiles = createSetInputFiles(wc)
  onProgress({ type: 'log', message: 'Iniciando automação...' })

  for (let index = 0; index < filiados.length; index++) {
    const filiado = filiados[index]
    try {
      onProgress({
        type: 'status',
        entry: { nome: filiado.nome, status: 'pending' },
      })

      await sleep(2000)
      await waitForElement(eJS, 'input.whsOnd.zHQkBf')
      onProgress({ type: 'log', message: '✅ Formulário carregado' })

      await removeFile(eJS, onProgress)
      await clearChecked(eJS, onProgress)

      await fillInputs(eJS, [
        { field: 'núcleo', value: config.nucleo },
        { field: 'secretário', value: config.nomeSecretario },
        { field: 'contato', value: config.contato },
        { field: 'filiado', value: filiado.nome },
        { field: 'valor', value: `R$ ${parseValor(filiado.valor)}` },
      ], onProgress)

      await clickRadioByText(eJS, config.valorReferente, onProgress)
      await selectInSelectBlock(eJS, 'Selecione o município', config.municipio, onProgress)
      await selectInCheckboxBlock(eJS, 'Informe o mês de referência', config.mes, onProgress)

      if (filiado.comprovante) {
        await uploadFile(eJS, filiado.comprovante, setInputFiles, onProgress)
      }

      onProgress({
        type: 'status',
        entry: { nome: filiado.nome, status: 'success' },
      })
      onProgress({ type: 'log', message: `✅ ${filiado.nome}` })
    } catch (e) {
      onProgress({
        type: 'status',
        entry: { nome: filiado.nome, status: 'error', error: String(e) },
      })
      onProgress({ type: 'error', message: `❌ ${filiado.nome}: ${e}` })
      throw e
    }
  }

  onProgress({ type: 'done', message: 'Todos os formulários enviados com sucesso!' })
}
