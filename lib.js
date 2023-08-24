
import { readFile, writeFile } from "fs/promises";

export const source = "https://p2k.stekom.ac.id/ensiklopedia"
export const provinsiUrl = "/Daftar_kabupaten_dan_kota_di_Indonesia"
export const provinsiSource = source + provinsiUrl

export const log = console.log
export const str = JSON.stringify
export const json = JSON.parse
export const jsonWrite = (/** @type {any} */ s) => JSON.parse(JSON.stringify(s))

let manifest

try {
  manifest = JSON.parse(await readFile('cache/manifest.json','utf-8'))
} catch (error) {
  await writeFile('cache/manifest.json','{}')
  manifest = {}
}

/**
 * cari halaman dalam cache, jika tidak ada, download
 * @param {string} url 
 */
export async function getPage(url) {
  let page = await getManifest(url)
  return page
}

/**
 * @param {string} name
 */
export async function getDist(name) {
  try {
    return JSON.parse(await readFile('dist/' + name + '.json','utf-8'))
  } catch (error) {
    return null
  }
}

/**
 * @param {import("fs").PathLike | import("fs/promises").FileHandle} path
 */
async function safeReadFile(path) {
  try {
    return await readFile(path,'utf-8')
  } catch (_) {
    return null
  }
}

import { randomUUID } from "crypto";

/**
 * @param {string | number} url
 * @param {string | NodeJS.ArrayBufferView | Iterable<string | NodeJS.ArrayBufferView> | AsyncIterable<string | NodeJS.ArrayBufferView> | import("stream").Stream} data
 */
async function writeManifest(url, data) {
  const manf = Object.values(manifest)
  
  let hash
  
  do {
    hash = randomUUID()
  } while (manf.includes(hash));
  
  manifest[url] = hash
  await writeFile('cache/' + hash + '.html', data)
  await writeFile('cache/manifest.json', JSON.stringify(manifest))
}


/**
 * @param {string} url
 */
async function getManifest(url) {
  let data
  if (manifest[url] && (data = await safeReadFile('cache/' + manifest[url] + '.html'))) {}
  else {
    const res = await fetch(url).then(e=>e.text())
    await writeManifest(url,res)
    data = res
  }
  return data
}

/**
 * @template T
 * @param {T|null|undefined} value
 */
export function safe(value) {
  if (!value) throw 'Elemen tidak ditemukan'
  return value
}

/**
 * @param {import('node-html-parser').HTMLElement} elem
 */
export function innerText(elem) {
  return elem.innerText
}