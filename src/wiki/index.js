
import { parse } from "node-html-parser";
import { getPage, innerText, setup, sourceDomain, str, print, safe, innerHTML } from "./lib.js";

const log = console.error
const err = (/** @type {any[]} */...msg) => console.error('[ERR]',...msg,'[/ERR]')
const loger = (/** @type {any[]} */...msg) => () => console.error('[ERR]',...msg,'[/ERR]')
const domain = "https://id.wikipedia.org"
await setup(domain,'wiki')
const path = '/wiki'
const wikiDomain = "https://id.wikipedia.org" + path
const provinsiUrl = '/Provinsi_di_Indonesia'

const result = {}

const q = parse(await getPage(wikiDomain + provinsiUrl))
const provinsiList = safe(q.querySelector('.wikitable > tbody'))
  .querySelectorAll('tr')
  .filter( tr => !(tr.querySelector('td')?.getAttribute('colspan')) )
  .slice(2)
  .map( tr => {
    const tds = tr.querySelectorAll('td')
    
    const kabUrl = safe(tds[9].querySelector('a')).getAttribute('href')
    
    const provinsi = safe(tr.querySelector('a')).innerText
    
    result[provinsi] = {}
    
    return {
      provinsi, kabUrl: domain + safe(kabUrl)
    }
  })
;

const specialProvinsi = [
  "Daerah Khusus Ibukota Jakarta",
  "Daerah Istimewa Yogyakarta",
  "Jawa Timur",
]

const kabupatenTabelPertama = [
  'Kabupaten Simeulue',
];

const kabupatenTabelKedua = [
  'Kabupaten Asahan',
  'Kabupaten Batu Bara',
];

const rowSpanned = [
  "Kabupaten Asahan",
  'Kabupaten Batu Bara',
];

for (const { kabUrl, provinsi } of provinsiList) {
  const q = parse(await getPage(kabUrl))
  console.error(provinsi)
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
      
      result[provinsi][kabupaten] = {}
      
      return { kecUrl: domain + kecUrl, kabupaten }
    })
  ;
  
  for (const {kecUrl,kabupaten} of urls) {
    console.error('kabupaten',kabupaten)
    
    const q = parse(await getPage(kecUrl))
    
    if (kabupatenTabelKedua.includes(kabupaten) || provinsi == 'Aceh' && !kabupatenTabelPertama.includes(kabupaten)) {
      const table = safe(q.querySelectorAll('.wikitable > tbody')[1],()=>{},q.querySelector('.wikitable > tbody'))
        .querySelectorAll('tr')
        .filter(tr => !(tr.querySelector('> th')))
        .forEach((tr,i) => {
          const tds = tr.querySelectorAll('> td');
          
          // PRONE
          if (tds.length == 1 && kabupaten == "Kabupaten Aceh Barat Daya") return
          if (tds.length == 2 && rowSpanned.includes(kabupaten)) return
          //'Kabupaten Batu Bara'
          const a = tds[1].querySelector('a')
          if (!a && kabupaten == 'Kabupaten Aceh Besar' ) return
          const kecamatan = safe(tds[1].querySelector('a')).innerText
          
          const kelurahanList = safe(
              tds[3]?.querySelectorAll('ul')[1],
              loger(tds[0]?.innerHTML,i),
              tds[4]?.querySelectorAll('ul')[1],
              tds[5]?.querySelectorAll('ul')[1],
              tds[4]?.querySelector('ul'),
              tds[3]?.querySelector('ul'),
              tds[5]?.querySelector('ul'),
              ).querySelectorAll('li')
            .map(innerHTML)
          ;
          
          result[provinsi][kabupaten][kecamatan] = kelurahanList
        })
      continue
    }
    
    safe(q.querySelector('.wikitable > tbody'))
      .querySelectorAll('tr')
      .filter(tr => !(tr.querySelector('> th')))
      .forEach((tr,i) => {
        const tds = tr.querySelectorAll('> td')
        const kecamatan = tds[1].innerText
        
        let kelurahanList
        
        if (tds[0].innerText.includes('Kelurahan')) {
          kelurahanList = safe(
            tds[1]?.querySelector('ul'),
            loger(tds[2]?.innerHTML, i),
            tds[2]?.querySelector('ul'),
            tds[3]?.querySelector('ul'),
            tds[4]?.querySelector('ul'),
          )
          .querySelectorAll('li')
          .map(innerHTML);
        }
        else if (i >= 6 && kabupaten == 'Kabupaten Serdang Bedagai') return;
        else {
          kelurahanList = safe(
              tds[5]?.querySelector('ul'),
              loger(tds[2]?.innerHTML, i),
              tds[3]?.querySelector('ul'),
              tds[5]?.querySelectorAll('ul')[1],
              tds[2]?.querySelector('ul'),
            )
            .querySelectorAll('li')
            .map(innerHTML);
        }
        
        result[provinsi][kabupaten][kecamatan] = kelurahanList
      })
  }
}

// for (const provinsi of provinsiList) {

//   const page = await getPage(
//     sourceDomain + '/di/' +
//     provinsi.toLowerCase().replace(/\s/g,'-') + '/'
//   )
  
//   const q = parse(page)

//   const trs = q.querySelectorAll('tbody > tr')
  
//   trs.map( tr => {
    
//     const [,kota,kecamatan,desa] = tr.querySelectorAll('span').map(innerText)
//     const kodepos = tr.querySelectorAll('strong')[0].innerText
    
//     if (!result[provinsi]) {
//       result[provinsi] = {}
//     }
    
//     if (!result[provinsi][kota]) {
//       result[provinsi][kota] = {}
//     }
    
//     if (!result[provinsi][kota][kecamatan]) {
//       result[provinsi][kota][kecamatan] = {}
//     }
    
//     result[provinsi][kota][kecamatan][desa] = kodepos
//   })
// }


// print(str(result))
// print(result)