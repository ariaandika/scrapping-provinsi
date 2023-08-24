# Web Scraping untuk Mendapatkan Wilayah Indonesia


## Strategi

source:
- [stekom](https://p2k.stekom.ac.id/ensiklopedia/Daftar_kabupaten_dan_kota_di_Indonesia)

### 1. Provinsi

pada halaman, berisi **tabel** untuk setiap provinsi

kita ingin daftar **provinsi** pada tabel pertama.
beruntung semua nama provinsi adalah `anchor`(`<a>`).
tapi, kolom **wilayah** juga berupa `anchor`.
setiap `anchor` memiliki `parent` elemen berupa `td`.
jika dilihat lebih dekat, `anchor` untuk wilayah, memiliki `parent` `td` dengan atribut `rowspan`, sedangkan untuk provinsi tidak.
kita bisa gunakan itu untuk mendapatkan list provinsi

```js
import { parse } from "node-html-parser";

const q = parse(halamanProvinsi)
const tabelProvinsi = q.querySelector('table')
const listProvinsi = tabelProvinsi
  .querySelectorAll('td:not([rowspan]) > a')
  .map( e => e.innerText )
```

ada cara lain, yaitu semua `h3` memiliki `span` `child` yang berisi provinsi tersebut

```js
const q = parse(halamanProvinsi)

const listProvinsi = q
  .querySelectorAll('h3')
  .map( e => e.querySelector('span').innerText )
```

### 2. Kabupaten

pada halaman berisi tabel untuk setiap provinsi

untuk membedakan dengan tabel pertama, tabel yang kita inginkan memiliki class `mw-collapsible`. Seperti sebelumnya, dalam setiap tabel terdapat banyak `tr`. Daftar kabupaten berbentuk elemen `anchor` dan merupakan `anchor` pertama dalam setiap tr. Tapi, pada `tr` pertama juga terdapat `anchor`, kita tidak butuh itu, jadi hapus `anchor` pertama dalam setiap tr

**masalah lebih spesifik**

tabel sumatra utara, tidak ada class `mw-collapsible`, jadi kita harus modifikasi selector menggunakan `table.wikitable`, dan hilangkan tabel pertama

```js
const q = parse(halamanProvinsi)

// list provinsi sebelumnya menggunakan *metode ke dua* !
let listProvinsi

const tabelList = q.querySelectorAll('table.wikitable')

tabelList.shift()

const kabupaten = tabelList.map( (provTabel, i) => {
  const judul = listProvinsi[i]
  const trs = provTabel.querySelectorAll('tr')
  
  trs.shift()
  
  const listKabupaten = trs.map( tr => {
    return tr.querySelector('a').innerText
  })
  
  return [judul, listKabupaten]
})
```



## Dasar

mencari elemen berdasarkan:

- urutan: pertama, kedua dari awal, atau terakhir
- perbedaan class, id, dan/atau tag