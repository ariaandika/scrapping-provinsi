
import x from "express";
import { readFile } from "fs/promises";
import { join } from "path";

const distPath = join('dist','wiki')

/** @type {Record<string,Record<string,Record<string,string[]>>>} */
const provinsiLengkap = JSON.parse(await readFile( join(distPath, 'provinsi/jawa.json') ,'utf-8'))
const provinsiList = JSON.parse(await readFile( join(distPath, 'provinsi.json') ,'utf-8'))
const kabupatenList = JSON.parse(await readFile( join(distPath, 'kabupaten.json') ,'utf-8'))


const app = x()

app.get('/provinsi', async (_,res) => res.json(provinsiList) )

app.get('/:provinsi/:kabupaten/:kecamatan',(req,res) => {
  const provinsiIn = req.params.provinsi.replace('-',' ')
  const kabupatenIn = req.params.kabupaten.replace('-',' ')
  const kecamatanIn = req.params.kecamatan.replace('-',' ')
  
  if (provinsiIn in provinsiLengkap) {
    const kabupatenLengkap = provinsiLengkap[provinsiIn]
    if (kabupatenIn in kabupatenLengkap) {
      const kecamatan = kabupatenLengkap[kabupatenIn]
      if (kecamatanIn in kecamatan) {
        return res.json({ data: kecamatan[kecamatanIn] })
      }
    }
  }
  
  res.status(404).json({ success: false, message: 'not found' })
})

app.get('/:provinsi/:kabupaten',(req,res) => {
  const provinsiIn = req.params.provinsi.replace('-',' ')
  const kabupatenIn = req.params.kabupaten.replace('-',' ')
  
  if (provinsiIn in provinsiLengkap) {
    const kabupatenLengkap = provinsiLengkap[provinsiIn]
    if (kabupatenIn in kabupatenLengkap) {
      const kecamatan = Object.keys(kabupatenLengkap[kabupatenIn])
      return res.json({ data: kecamatan })
    }
  }
  
  res.status(404).json({ success: false, message: 'not found' })
})

app.get('/:provinsi',(req,res) => {
  const provinsi = req.params.provinsi.replace('-',' ')
  
  if (provinsi in kabupatenList) {
    return res.json({ data: kabupatenList[provinsi] })
  }
  
  res.status(404).json({ success: false, message: 'not found' })
})

app.listen(4040)