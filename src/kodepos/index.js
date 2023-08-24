
import { parse } from "node-html-parser";
import { getPage, innerText, setup, sourceDomain, str, print } from "./lib.js";
import provinsiList from "./provinsi.json" assert { type: 'json' };

await setup("https://nomorkodepos.com",'kodepos')

const result = {}

for (const provinsi of provinsiList) {

  const page = await getPage(
    sourceDomain + '/di/' +
    provinsi.toLowerCase().replace(/\s/g,'-') + '/'
  )
  
  const q = parse(page)

  const trs = q.querySelectorAll('tbody > tr')
  
  trs.map( tr => {
    
    const [,kota,kecamatan,desa] = tr.querySelectorAll('span').map(innerText)
    const kodepos = tr.querySelectorAll('strong')[0].innerText
    
    if (!result[provinsi]) {
      result[provinsi] = {}
    }
    
    if (!result[provinsi][kota]) {
      result[provinsi][kota] = {}
    }
    
    if (!result[provinsi][kota][kecamatan]) {
      result[provinsi][kota][kecamatan] = {}
    }
    
    result[provinsi][kota][kecamatan][desa] = kodepos
  })
}


print(str(result))