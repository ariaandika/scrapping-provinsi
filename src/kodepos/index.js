
import { parse } from "node-html-parser";
import { getPage, innerText, setup, sourceDomain, str, print } from "./lib.js";

await setup("https://nomorkodepos.com",'kodepos')

const page = await getPage(sourceDomain + '/di/di-yogyakarta')
const q = parse(page)

const trs = q.querySelectorAll('tbody > tr')

const result = {}

trs.map( tr => {
  
  const [,kota,kecamatan,desa] = tr.querySelectorAll('span').map(innerText)
  const kodepos = tr.querySelectorAll('strong')[0].innerText
  
  if (!result[kota]) {
    result[kota] = {}
  }
  
  if (!result[kota][kecamatan]) {
    result[kota][kecamatan] = {}
  }
  
  result[kota][kecamatan][desa] = kodepos
})

print(str(result))