
import { parse } from "node-html-parser";
import { getPage, innerText, setup, sourceDomain, str, print, safe, innerHTML, getDist } from "../wiki/lib.js";
import { writeFile } from "fs/promises";

const log = console.error
const de = (/** @type {any[]} */...msg) => console.error('[LOG]',...msg,'[/LOG]')
const loger = (/** @type {any[]} */...msg) => () => console.error('[ERR]',...msg,'[/ERR]')
const o = Object.fromEntries
const domain = "https://id.wikipedia.org"
await setup(domain,'wiki')
const path = '/wiki'
const wikiDomain = "https://id.wikipedia.org" + path
const provinsiUrl = '/Provinsi_di_Indonesia'

const result = {}

async function main() {
  const q = parse(await getPage(wikiDomain + provinsiUrl))
  const provinsiList = safe(q.querySelector('.wikitable > tbody'))
    .querySelectorAll('tr')
    .filter( tr => !(tr.querySelector('td')?.getAttribute('colspan')) )
    .slice(2)
    .map( tr => {
      const tds = tr.querySelectorAll('td')
      
      const kabUrl = safe(tds[9].querySelector('a')).getAttribute('href')
      
      const provinsi = safe(tr.querySelector('a')).innerText
      
      result[provinsi] = []
      
      return {
        provinsi, kabUrl: domain + safe(kabUrl)
      }
    })
  
  const specialProvinsi = [
    "Daerah Khusus Ibukota Jakarta",
    "Daerah Istimewa Yogyakarta",
    "Jawa Timur",
  ]
  
  
  for (const { kabUrl, provinsi } of provinsiList) {
    const q = parse(await getPage(kabUrl))
    
    const urls = safe(q.querySelector('.wikitable > tbody'))
      .querySelectorAll('tr')
      .filter(tr => !(tr.querySelector('th')))
      .map( (tr) => {
        const kabupaten = safe(tr.querySelector('a')).innerText
        
        const kecUrl = safe(
          tr.querySelectorAll('td')[
            specialProvinsi.includes(provinsi)
            ?8:7]
          .querySelector('a')
          ?.getAttribute('href')
        )
        
        // result[provinsi][kabupaten] = {}
        result[provinsi].push(kabupaten)
        
        return { kecUrl: domain + kecUrl, kabupaten }
      })
    ;
  }
  
  // print(str(provinsiList.map( e => e.provinsi )))
  // print(str(result))
  await writeFile('dist/wiki/kabupaten.json',str(result))
}


/**
81b85b29-0567-456a-9de2-f50e5d9e879f
b7d52300-66b4-4d83-a097-fb8b6124261b
4d1a429b-fc2f-4d42-a62a-94cf0aa90bd2
12d0b8fb-dcd4-4da4-8485-dd7084ace1bd
d77b6666-a39c-48c4-a325-88e456990681
7b5a921c-ddc1-44de-b2ec-ce9f72611a64
 */

const selectedProvinsi = {
  "Jawa Barat":"https://id.wikipedia.org/wiki/Daftar_kabupaten_dan_kota_di_Jawa_Barat",
  "Jawa Tengah":"https://id.wikipedia.org/wiki/Daftar_kabupaten_dan_kota_di_Jawa_Tengah",
  "Jawa Timur":"https://id.wikipedia.org/wiki/Daftar_kabupaten_dan_kota_di_Jawa_Timur",
  "Daerah Istimewa Yogyakarta":"https://id.wikipedia.org/wiki/Daftar_kabupaten_dan_kota_di_Daerah_Istimewa_Yogyakarta",
  "Daerah Khusus Ibukota Jakarta":"https://id.wikipedia.org/wiki/Daftar_kabupaten_dan_kota_administrasi_di_Daerah_Khusus_Ibukota_Jakarta",
  "Banten":"https://id.wikipedia.org/wiki/Daftar_kabupaten_dan_kota_di_Banten",
}

async function kabupaten() {
  const provinsiList = await Promise.all( Object.entries(selectedProvinsi).map( async ([provinsi,url]) => {
    const q = parse(await getPage(url))
    
    const kabupatenList = safe(q.querySelector('tbody'))
      .querySelectorAll('> tr')
      .filter( tr => !(tr.querySelector('> th')))
      .map( (tr,i) => {
        
        const kabupaten = safe(tr.querySelector('a')?.innerText)
        const url = domain + safe(
          tr.querySelector('> td[align="center"] > a'),
          loger(provinsi,q.querySelector('title')?.innerText,i),
        ).getAttribute('href')
        
        
        return { kabupaten, url }
      })
    
    return { provinsi, kabupatenList }
  }));
  // print(provinsiList.find( e => e.provinsi == 'Jawa Tengah'))
  // print( provinsiList.map( e => e.kabupatenList.map( f => `${f.kabupaten} = ${f.url}` )  ) )
  
  const provinsiResultList = provinsiList.map( async ({ provinsi, kabupatenList }) => {
    
    const kabupatenResultList = await Promise.all(  kabupatenList.map( async ({ kabupaten, url  }) => {
      const q = parse(await getPage(url))
      
      const wilayah = safe(q.querySelector('tbody'))
        .querySelectorAll('> tr')
        .filter( tr => !(tr.querySelector('> th')))
        .map( (tr,i) => {
          
          const kecamatan = safe(tr.querySelector('a')?.innerText)
          
          const kelurahan = safe(
            tr.querySelector('ul')?.querySelectorAll('> li > a'),
            loger(kabupaten,i),
            tr.querySelectorAll('a')
          )
            .map(innerText)
          
          // de(kabupaten,kecamatan, kelurahan.length)
          
          return [kecamatan,kelurahan]
        })
      
      return [kabupaten,o(wilayah)]
    }))
    
    return [provinsi, o(kabupatenResultList)]
  })
  
  // print(await Promise.all(provinsiResultList))
  await writeFile('dist/wiki/provinsi/jawa.json',str(o(await Promise.all(provinsiResultList))))
}
kabupaten()