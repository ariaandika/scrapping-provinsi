
import { getDist, getPage, innerText, log, provinsiSource, safe, str } from "./lib.js";
import { parse } from "node-html-parser";

log(await getKecamatanHref())


async function getProvinsiList() {
  const q = parse(await getPage(provinsiSource))

  const tabelProvinsi = safe( q.querySelector('table') )
  const listProvinsi = tabelProvinsi
    .querySelectorAll('td:not([rowspan]) > a')
    .map(innerText)

  return listProvinsi
}

async function getProvinsiList2() {
  const q = parse(await getPage(provinsiSource))
  return q
    .querySelectorAll('h3')
    .map( e => safe(e.querySelector('span')).innerText )
}

async function getKabupaten() {
  
  /** @type {string[]} */
  const provList = await getDist('provinsi') ?? await getProvinsiList2()
  const q = parse(await getPage(provinsiSource))

  const tabelList = q.querySelectorAll('table.wikitable')

  tabelList.shift()

  const kabupaten = tabelList.map( (provTabel, i) => {
    const judul = provList[i]
    const trs = provTabel.querySelectorAll('tr')
    
    trs.shift()
    
    const listKabupaten = trs
      .map( tr => safe(tr.querySelector('a')) )
      .map(innerText)
    
    return [judul, listKabupaten]
  })

  return Object.fromEntries(kabupaten)
}

async function getKecamatanHref() {
  const q = parse(await getPage(provinsiSource))
  const provList = await getDist('provinsi') ?? await getProvinsiList2()
  const tabelList = q.querySelectorAll('table.wikitable')
  tabelList.shift()

  return tabelList.map( (provTabel, i) => {
    
    const title = provList[i]
    const trs = provTabel.querySelectorAll('tr')
    trs.shift()
    
    const links = trs
      .map( tr => {
        const title = safe(tr.querySelector('a')).innerText;
        
        const links = tr
          .querySelectorAll('td')[i == 1 ? 7 : 6]
          .querySelector('a')
          ?.getAttribute('href')
        
        return [title,safe(links)]
      })
    
    return [title,Object.fromEntries(links)]
  })
}