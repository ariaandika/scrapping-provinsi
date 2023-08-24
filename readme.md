# Web Scraping untuk Mendapatkan Wilayah Indonesia

## Stekom

source:
- [stekom](https://p2k.stekom.ac.id/ensiklopedia/Daftar_kabupaten_dan_kota_di_Indonesia)

## peringatan:
- banyak halaman kecamatan / kelurahan yang tidak konsisten, segala error hanya akan dilewati, namun bisa dilihat di terminal, hasil akhirnya data tidak lengkap

### 1. Provinsi

pada halaman, berisi **tabel** untuk setiap provinsi

kita ingin daftar **provinsi** pada tabel pertama.
beruntung semua nama provinsi adalah `anchor`(`<a>`).
tapi, kolom **wilayah** juga berupa `anchor`.
setiap `anchor` memiliki `parent` elemen berupa `td`.
jika dilihat lebih dekat, `anchor` untuk wilayah, memiliki `parent` `td` dengan atribut `rowspan`, sedangkan untuk provinsi tidak.
kita bisa gunakan itu untuk mendapatkan list provinsi

```js
// ini hanya pseudo code
import { parse } from "node-html-parser";

const q = parse(halamanProvinsi)
const tabelProvinsi = q.querySelector('table')
const listProvinsi = tabelProvinsi
  .querySelectorAll('td:not([rowspan]) > a')
  .map( e => e.innerText )
```

ada cara lain, yaitu semua `h3` memiliki `span` `child` yang berisi provinsi tersebut

```js
// ini hanya pseudo code
const q = parse(halamanProvinsi)

const listProvinsi = q
  .querySelectorAll('h3')
  .map( e => e.querySelector('span').innerText )
```

### 2. Kabupaten

pada halaman berisi tabel untuk setiap provinsi

untuk membedakan dengan tabel pertama, tabel yang kita inginkan memiliki class `mw-collapsible`. Seperti sebelumnya, dalam setiap tabel terdapat banyak `tr`. Daftar kabupaten berbentuk elemen `anchor` dan merupakan `anchor` pertama dalam setiap tr. Tapi, pada `tr` pertama juga terdapat `anchor`, kita tidak butuh itu, jadi hapus `anchor` pertama dalam setiap tr

**masalah lebih spesifik**

tabel Sumatra Utara, tidak ada class `mw-collapsible`, jadi kita harus modifikasi selector menggunakan `table.wikitable`, dan hilangkan tabel pertama

```js
// ini hanya pseudo code
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

### 3. Kecamatan dan Kelurahan `href`

disinilah kita mulai navigasi dan mulai _scrapping_ ke setiap halaman lain

dalam setiap tabel provinsi, pada baris kabupaten yang berupa `tr`, terdapat kolom kecamatan berisi jumlah kecamatan. Jumlah kecamatan tersebut berupa `anchor` yang mengarah ke halaman lain. Halaman tersebut berisi daftar kecamatan pada kabupaten yang bersangkutan, dalam halaman inilah data yang kita inginkan.

untuk mendapatkan `anchor` tersebut, untuk setiap tabel, kita ambil `td` ke-6 dari setiap `tr`. `td` tersebut berisi `anchor` yang kita inginkan


```js
// ini hanya pseudo code
const q = parse(halamanProvinsi)

// gunakan cara seperti sebelumnya
let tabelProvinsi

const tabelLinks = tabelProvinsi.map((provTabel, i) => {
  const trs = provTabel.querySelectorAll('tr')
  trs.shift()
  
  const links = trs
    .map( tr => tr
      .querySelectorAll('td')[6]
      .querySelector('a')
      .getAttribute('href')
    )
  
  return links
})
```

**masalah lebih detail:**

tabel Sumatra Utara memiliki kolom khusus IPM, yang terletak pada td ke-6. Kasus ini **HANYA** terjadi pada tabel Sumatra Utara, jadi untuk sekarang kita tambah kondisi khusus, Sumatra Utara terdapat pada iterasi ke-2, yaitu index 1, kita tambahkan kondisi khusus di sana, dimana kita ambil `td` ke 7


```js
// ini hanya pseudo code
const q = parse(halamanProvinsi)

// gunakan cara seperti sebelumnya
let tabelProvinsi

const tabelLinks = tabelProvinsi.map((provTabel, i) => {
  const trs = provTabel.querySelectorAll('tr')
  trs.shift()
  
  const links = trs
    .map( tr => tr
      .querySelectorAll('td')[i == 1 ? 7 : 6]
      .querySelector('a')
      .getAttribute('href')
    )
  
  return links
})
```

saat ini kita mendapatkan `link` / `href` untuk setiap kabupaten yang menuju ke halaman yang berisi kecamatan dan kelurahan. Setelah ini bergantung apakah setiap halaman kelurahan dan kecamatan memiliki konsep yang sama.

### 4. Kecamatan dan Kelurahan dalam halaman

bagian ini digunakan di setiap halaman

dalam halaman, terdapat tabel dengan atribut `width="100%"`. tabel tersebut memiliki banyak `tr`, untuk menghilangkan header dan footer tabel, filter `tr` yang tidak memiliki atribut `style`. Di setiap `tr`, kita ambil `anchor` dalam `td` ke-dua, dari sini kita mendapatkan **kecamatan**. Masih dalam `tr` yang sama, pada `td` ke-4, terdapat tabel lain yang berisi data kelurahan. Karena datanya sangat dalam, dari `tr` kita bisa langsung mencari elemen `ul`, tapi `ul` ada dua, kita ambil yang terakhir. `ul` ini berisi `li` **kelurahan**.

**masalah lebih detail:**

filter `tr` yang tidak memiliki atribut `style` tidak cukup, ternyata ada `tr` lainya di dalam `tabel` yang tidak kita inginkan. Beruntung `tr` yang kita inginkan terdapat atribute `valign="top"`, kita bisa tambahkan ini dalam selector.

Kabupaten Simeulue, tidak ada dua `ul` dalam `tr`, jadi tambahkan kondisi khusus jika `ul[1]` tidak ada, maka gunakan `ul[0]`.

```js
// ini hanya pseudo code
const wilayahLengkap = links.map( (prov,kabupatenList) => {
  
  const kabupatenResult = kabupatenList.map( (kabupaten, link) => {
      
    const q = parse(await getPage(sourceDomain + link))

    const tabel = q.querySelector('table[width]')
    const trs = tabel.querySelectorAll('tr[valign="top"]:not([style])')
    
    const kecamatanList = trs.map( (tr,i) => {
      const kecamatan = tr
        .querySelectorAll('td')[1]
        .querySelector('a')
        .innerText
      
      const kelurahanList = tr
        .querySelectorAll('ul')[1]
        .querySelectorAll('li')
        .map(innerText)
      
      return [kecamatan,kelurahanList]
    })
    
    return [kabupaten,kecamatanList]
  })
  
  return [prov,kabupatenResult]
})
```

## Dasar

mencari elemen berdasarkan:

- urutan: pertama, kedua dari awal, atau terakhir
- perbedaan class, id, dan/atau tag