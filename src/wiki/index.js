
import { parse } from "node-html-parser";
import { getPage, innerText, setup, sourceDomain, str, print, safe } from "./lib.js";


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

for (const { kabUrl, provinsi } of provinsiList) {
  const q = parse(await getPage(kabUrl))
  
  const urls = safe(q.querySelector('.wikitable > tbody'))
    .querySelectorAll('tr')
    .map( (tr,i) => {
      if (tr.querySelector('th')) {return undefined}
      
      const kabupaten = safe(tr.querySelector('a')).innerText
      
      const kecUrl = tr.querySelectorAll('td')[7].getAttribute('href')
      
      result[provinsi][kabupaten] = {}
      
      return domain + kecUrl
    })
  ;
  
  // for (const kecUrl of urls) {
  //   const q = parse(await getPage(kecUrl))
    
    
  // }
}

print(result)



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
print(result)