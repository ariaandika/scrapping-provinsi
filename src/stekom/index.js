
import { getDist, getPage, innerText, log as print, provinsiSource, safe, sourceDomain, str } from "./lib.js";
import { parse } from "node-html-parser";
import { writeFile, mkdir } from "fs/promises";

const links = await getKecamatanHref()
console.error(links.length)

const outPath = 'dist/stekom/prov'
const result = []

/*
GOAL

stack:
provinsi
  kabupaten
    kecamatan
      kelurahan

- paling kecil: satu kecamatan satu file, berisi list kelurahan
- menengah: satu kabupaten satu file, berisi semua kecamatan dan kelurahan  
  mungkin paling ideal

  
*/

for (const [prov,kabupatenList] of links) {
  await mkdir(outPath + '/' + prov, { recursive: true })
  
  for (const kab of kabupatenList) {
    const kabupatenResult = []
    
    try {
      kabupatenResult.push(await page(kab))
    } catch (error) {
      console.error('ERROR',kab[0],error)
      kabupatenResult.push([kab[1],{}])
    }
    
    await writeFile(outPath + '/' + prov + '/' + kab[0] + '.json',str(Object.fromEntries(kabupatenResult)), {  })
  }
  
  // result.push( [prov,Object.fromEntries(kabupatenResult)])
}

// const result = links.map( async ([prov,kabupatenList]) => {
//   // const kabupatenResult = await Promise.all(
//   //   kabupatenList.map(page)
//   // )
  
//   const kabupatenResult = []
  
//   for (const kab of kabupatenList) {
//     kabupatenResult.push(await page(kab))
//   }
  
//   return [prov,kabupatenResult]
// })

/// test
// const prov = links[0][0]
// const kab = links[0][1][0][0]
// const kabLink = links[0][1][0][1]
// const result = await page([kab,kabLink])

// print(str(result))

/**
 * @param {readonly [string,string]} param0 
 */
async function page([kabupaten,link]) {
  const q = parse(await getPage(sourceDomain + link))
  const tabel = q.querySelector('table[width]')
  
  if (!tabel) {
    console.error(kabupaten, "GAGAL")
    return /** @type {const} */ ([kabupaten,{}])
  }
  console.error(kabupaten)
  
  const trs = tabel.querySelectorAll('tr[valign="top"]:not([style])')
  
  const kecamatanList = trs.map( (tr,i) => {
    const kecamatan = safe(tr
      .querySelectorAll('td')[1]
      .querySelector('a')
    ).innerText
    
    
    const ul = tr.querySelectorAll('ul')
    
    // Kabupaten Simeulue, tidak ada dua `ul`
    const kelurahanList = (ul[1] ?? ul[0])
      .querySelectorAll('li')
      .map(innerText)
    
    return /** @type {const} */ ([kecamatan,kelurahanList])
  })
  
  return /** @type {const} */ ([kabupaten,Object.fromEntries(kecamatanList)])
}



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

  const links = tabelList.map( (provTabel, i) => {
    
    /** @type {string} */
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
        
        return /** @type {const} */ ( [title,safe(links)] )
      })
    
    return /** @type {const} */ ( [title,links] )
  })
  
  return links
}