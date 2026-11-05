---
track: odoo
nomor: 3
judul: "Manifest & inheritance: menumpang di modul lain tanpa menyalinnya"
slug: manifest-dan-inheritance
estimasi_menit: 12
prasyarat:
  - odoo/view-xml-qweb
latihan:
  - id: odoo-03-latihan-1
    jenis: web
    bahasa: python
    soal: "Tiru dua pekerjaan Odoo saat memasang modul. (1) Tentukan urutan muat: modul hanya bisa dimuat kalau semua `depends`-nya sudah dimuat; cetak urutannya, lalu modul yang tidak bisa dipasang beserta dependensi yang tidak ada. (2) Terapkan warisan view: tiap view warisan menyisipkan satu field setelah sasaran xpath-nya, diterapkan urut `priority` kecil ke besar; view yang induknya tidak ada dilewati. Cetak urutan pewarisan, view yang dilewati, field akhir, dan jumlahnya."
    kode_awal: |-
      import re

      manifest = {
          "base": {"depends": [], "data": []},
          "toko": {"depends": ["base"], "data": ["views/produk.xml"]},
          "toko_diskon": {"depends": ["toko"], "data": ["views/diskon.xml"]},
          "toko_laporan": {"depends": ["toko", "toko_diskon"], "data": ["report/laporan.xml"]},
          "toko_ekspor": {"depends": ["toko", "report_xlsx"], "data": ["views/ekspor.xml"]},
      }

      # arch view dasar produk.form
      dasar = ["kode", "nama", "harga"]

      # tiap baris = satu record ir.ui.view dengan inherit_id terisi
      warisan = [
          {"id": "produk.form.diskon", "induk": "produk.form", "priority": 30,
           "expr": "//field[@name='nama']", "position": "after", "field": "diskon"},
          {"id": "produk.form.total", "induk": "produk.form", "priority": 20,
           "expr": "//field[@name='pajak']", "position": "after", "field": "total"},
          {"id": "produk.form.pajak", "induk": "produk.form", "priority": 10,
           "expr": "//field[@name='harga']", "position": "after", "field": "pajak"},
          {"id": "produk.form.gudang", "induk": "produk.form.lama", "priority": 15,
           "expr": "//field[@name='nama']", "position": "after", "field": "gudang"},
      ]

      # 1. urutan muat: modul yang dependensinya sudah lengkap, urut nama
      #    cetak "urutan muat: a, b, c"
      #    cetak "tidak bisa dipasang: <modul> (butuh <dependensi yang tidak ada>)"

      # 2. urutan pewarisan: priority kecil dulu
      #    cetak "urutan pewarisan: id (priority), id (priority), ..."
      #    cetak "dilewati: <id> (induk <induk> tidak ada)" untuk induk yang tidak ada
      #    sisipkan field setelah sasaran xpath; cetak "field akhir: ..." dan "jumlah field: <n>"
    output_harapan: |-
      urutan muat: base, toko, toko_diskon, toko_laporan
      tidak bisa dipasang: toko_ekspor (butuh report_xlsx)
      urutan pewarisan: produk.form.pajak (10), produk.form.gudang (15), produk.form.total (20), produk.form.diskon (30)
      dilewati: produk.form.gudang (induk produk.form.lama tidak ada)
      field akhir: kode, nama, diskon, harga, pajak, total
      jumlah field: 6
    solusi: |-
      import re

      manifest = {
          "base": {"depends": [], "data": []},
          "toko": {"depends": ["base"], "data": ["views/produk.xml"]},
          "toko_diskon": {"depends": ["toko"], "data": ["views/diskon.xml"]},
          "toko_laporan": {"depends": ["toko", "toko_diskon"], "data": ["report/laporan.xml"]},
          "toko_ekspor": {"depends": ["toko", "report_xlsx"], "data": ["views/ekspor.xml"]},
      }

      dasar = ["kode", "nama", "harga"]

      warisan = [
          {"id": "produk.form.diskon", "induk": "produk.form", "priority": 30,
           "expr": "//field[@name='nama']", "position": "after", "field": "diskon"},
          {"id": "produk.form.total", "induk": "produk.form", "priority": 20,
           "expr": "//field[@name='pajak']", "position": "after", "field": "total"},
          {"id": "produk.form.pajak", "induk": "produk.form", "priority": 10,
           "expr": "//field[@name='harga']", "position": "after", "field": "pajak"},
          {"id": "produk.form.gudang", "induk": "produk.form.lama", "priority": 15,
           "expr": "//field[@name='nama']", "position": "after", "field": "gudang"},
      ]

      dimuat = []
      while True:
          calon = sorted(
              n for n in manifest
              if n not in dimuat and all(d in dimuat for d in manifest[n]["depends"])
          )
          if not calon:
              break
          dimuat.append(calon[0])
      print("urutan muat:", ", ".join(dimuat))

      for n in sorted(manifest):
          if n not in dimuat:
              hilang = [d for d in manifest[n]["depends"] if d not in manifest]
              print(f"tidak bisa dipasang: {n} (butuh {', '.join(hilang)})")

      urut = sorted(warisan, key=lambda v: v["priority"])
      print("urutan pewarisan:", ", ".join(f'{v["id"]} ({v["priority"]})' for v in urut))

      field = list(dasar)
      for v in urut:
          sasaran = re.search(r"@name='([^']+)'", v["expr"]).group(1)
          if v["induk"] != "produk.form":
              print(f'dilewati: {v["id"]} (induk {v["induk"]} tidak ada)')
          elif sasaran not in field:
              print(f'gagal: {v["id"]} (xpath {v["expr"]} tidak menemukan sasaran)')
          else:
              field.insert(field.index(sasaran) + 1, v["field"])

      print("field akhir:", ", ".join(field))
      print("jumlah field:", len(field))
    catatan_solusi: "Bagian pertama meniru cara Odoo menyusun urutan pemasangan: ia memuat modul yang dependensinya sudah lengkap, dan menolak yang dependensinya tidak dikenal. Bagian kedua menunjukkan kenapa `priority` ada. `pajak` (priority 10) menyisipkan dirinya setelah `harga`; baru setelah itu `total` (20) bisa menemukan `pajak` karena field itu sudah ada. Kalau `total` diterapkan lebih dulu, xpath-nya gagal. `diskon` (30) mencari `nama` yang sejak awal ada, jadi ia selalu berhasil. Satu view yang induknya tidak ada dilewati tanpa menghentikan yang lain — di Odoo, induk yang hilang justru menggagalkan pemasangan, dan urutan ini menjelaskan kenapa."
  - id: odoo-03-latihan-2
    jenis: laptop
    soal: "Di database Odoo percobaan, buktikan bahwa view yang kamu lihat di layar adalah hasil gabungan beberapa view warisan, dan bahwa `depends` di manifest benar-benar menjadi daftar dependensi modul di database."
    kebutuhan:
      - "Browser (Chrome/Edge)"
      - "Database Odoo percobaan dari modul 01 (atau buat baru di https://www.odoo.com/start)"
      - "Akses administrator database"
    langkah:
      - perintah: "Login ke database, buka Settings, aktifkan developer mode kalau menu Technical belum muncul"
        penjelasan: "Mode developer membuka bagian struktur database. Tanpa ini, view warisan dan daftar modul tidak bisa diperiksa."
      - perintah: "Settings → Technical → User Interface → Views, cari 'product.template.form', buka barisnya"
        penjelasan: "Ini view form induk untuk model produk. Namanya dipakai modul lain sebagai `inherit_id`, jadi ia punya banyak view turunan."
      - perintah: "Di halaman view itu, cari daftar view yang mewarisinya (tab/tombol 'Inherited Views')"
        penjelasan: "Daftar ini berisi view dari modul lain yang menyebut view ini sebagai induk. Setiap baris = satu record ir.ui.view dengan inherit_id terisi. Inilah bentuk nyata dari inheritance: tidak ada satu pun yang menyalin arch induknya."
      - perintah: "Buka salah satu view turunan itu, perhatikan field 'Inherited View' dan isi tab Architecture"
        penjelasan: "Field itu menunjuk balik ke product.template.form. Arch-nya pendek: hanya `<data>` berisi `<xpath expr=... position=...>`. Tidak ada `<form>` di dalamnya — karena ia tidak berdiri sendiri, ia menumpang."
      - perintah: "Settings → Technical → Modules → Modules, cari 'sale', perhatikan kolom Dependencies"
        penjelasan: "Kolom itu diisi Odoo dari kunci `depends` di __manifest__.py saat modul dipindai. Modul yang dependensinya belum terpasang tidak bisa di-install — dan kolom ini adalah daftar yang dipakai untuk memeriksanya."
      - perintah: "Buka baris modul 'sale', lihat field Dependencies di form-nya, bandingkan dengan kolom tadi"
        penjelasan: "Isinya sama. Yang kamu baca di layar adalah manifest yang sama yang ditulis pengembang modul sebagai dict Python di berkas __manifest__.py."
    hasil: |-
      product.template.form
        Inherited Views: beberapa baris, antara lain product.template.form.sale
        (tiap baris = satu view dari modul lain)

      View turunan (mis. product.template.form.sale)
        Inherited View : product.template.form
        Architecture   : <data><xpath expr="..." position="...">...</xpath></data>

      Modules → sale
        Dependencies : daftar modul yang wajib terpasang lebih dulu
                       (isinya berasal dari `depends` di manifest modul itu)
    cek_berhasil:
      - "View product.template.form ditemukan dan daftar Inherited Views-nya tidak kosong"
      - "Salah satu view turunan punya Inherited View = product.template.form dan arch-nya hanya berisi xpath"
      - "Modul sale menampilkan daftar Dependencies di form modul"
    kalau_gagal:
      - error: "Menu 'Technical' tidak muncul di Settings"
        arti: "Mode developer belum aktif atau halaman belum dimuat ulang."
        perbaikan:
          - "Muat ulang halaman (Ctrl+R) setelah mengaktifkan mode developer"
          - "Di versi lebih baru tautannya ada di Settings → Developer Tools"
          - "Pastikan login sebagai administrator database, bukan user biasa"
      - error: "Pencarian 'product.template.form' tidak menemukan baris apa pun"
        arti: "Nama view bisa berbeda antar versi, atau modul yang memilikinya belum terpasang."
        perbaikan:
          - "Kosongkan kotak pencarian, tekan Enter, lalu saring manual dengan kolom Model = product.template"
          - "Coba view lain yang pasti punya turunan, mis. 'res.partner.form'"
          - "Pasang modul Sales lewat Apps kalau database masih kosong"
      - error: "Daftar 'Inherited Views' kosong padahal view-nya benar"
        arti: "Kamu membuka view turunan, bukan induknya — atau modul yang mewarisinya belum terpasang."
        perbaikan:
          - "Periksa field 'Inherited View': kalau terisi, kamu sedang di view turunan; buka induk yang disebut di situ"
          - "Pasang modul yang mewarisinya (mis. Sales), lalu muat ulang"
      - error: "Kolom 'Dependencies' tidak ada di daftar Modules"
        arti: "Kolom itu disembunyikan; di beberapa versi hanya muncul di form modul."
        perbaikan:
          - "Buka baris modulnya dan lihat field Dependencies di form"
          - "Kalau tetap tidak ada, buka daftar Modules dalam mode developer dan tambahkan kolom lewat ikon pengaturan kolom"
    buktikan:
      perubahan: "Buka view turunan tadi, catat satu field yang disisipkannya, lalu buka form produk dan cari field itu."
      hasil_diharapkan: "Field itu muncul di form produk, padahal tidak ada satu pun view yang memuat seluruh isi form tersebut. Yang kamu lihat adalah arch induk yang sudah disisipi potongan dari beberapa view warisan, digabung saat Odoo memuat halaman."
kuis:
  - tipe: pilihan_ganda
    pertanyaan: "Apa bedanya view dengan `inherit_id` terisi dan view tanpa `inherit_id`?"
    opsi:
      a: "Yang ber-`inherit_id` adalah view baru yang berdiri sendiri; yang tanpa `inherit_id` adalah turunan"
      b: "Yang ber-`inherit_id` menumpang pada view lain dan hanya memuat perubahan; yang tanpa `inherit_id` adalah view utama yang berdiri sendiri"
      c: "Keduanya sama; `inherit_id` hanya penanda urutan tampil di menu"
      d: "Yang ber-`inherit_id` disimpan di tabel lain, bukan ir.ui.view"
    jawaban: b
    penjelasan: "View dengan `inherit_id` adalah view ekstensi: arch-nya hanya berisi `<xpath>` yang menyisipkan, mengganti, atau menghapus elemen pada arch induk. View tanpa `inherit_id` adalah view utama — ia punya arch lengkap dengan akar `<form>` atau `<list>`. Membedakan keduanya penting saat menyunting: mengubah view utama mengubah tampilan semua turunannya sekaligus."
    tingkat: dasar
  - tipe: pilihan_ganda
    pertanyaan: "Kenapa menambah field lewat view warisan lebih baik daripada menyalin view induk lalu menyunting salinannya?"
    opsi:
      a: "Karena view warisan lebih cepat dimuat browser"
      b: "Karena salinan tidak ikut berubah saat modul asalnya diperbarui, sehingga tampilanmu tertinggal dan rawan bentrok"
      c: "Karena Odoo menolak view yang tidak memakai inheritance"
      d: "Karena salinan tidak bisa diberi field baru"
    jawaban: b
    penjelasan: "Salinan adalah potret keadaan saat kamu menyalin. Begitu modul asalnya menambah kolom atau mengubah tata letak, salinanmu tidak ikut berubah — dan setelah upgrade, pengguna melihat dua perilaku berbeda di dua tempat. View warisan hanya menyebut perubahannya, jadi ia tetap menempel pada induk yang terus diperbarui. Itu juga alasan menyalin view milik modul lain dianggap praktik buruk."
    tingkat: menengah
  - tipe: pilihan_ganda
    pertanyaan: "Dua view warisan sama-sama menyisipkan field setelah `harga`. Yang satu `priority` 10, yang lain 20. Bagaimana hasil akhirnya?"
    opsi:
      a: "Yang priority 20 diterapkan lebih dulu, jadi field-nya lebih dekat ke `harga`"
      b: "Yang priority 10 diterapkan lebih dulu, jadi field-nya lebih dekat ke `harga`"
      c: "Odoo memilih salah satu secara acak"
      d: "Pemasangan modul gagal karena bentrok"
    jawaban: b
    penjelasan: "`priority` kecil diterapkan lebih dulu. View pertama menyisipkan field-nya langsung setelah `harga`; view kedua lalu menyisipkan setelah `harga` juga, sehingga field-nya berada di antara `harga` dan field dari view pertama. Urutan ini bukan kosmetik: kalau satu view menyisipkan setelah field yang baru dibuat view lain, priority-nya harus lebih besar — kalau tidak, xpath-nya tidak menemukan sasaran dan pemasangan gagal."
    tingkat: lanjutan
  - tipe: isian_singkat
    pertanyaan: "Kunci di __manifest__.py yang berisi daftar modul yang harus terpasang lebih dulu adalah ... (satu kata)"
    jawaban: "depends"
    penjelasan: "`depends` menentukan urutan pemasangan sekaligus syarat: modul tidak bisa di-install kalau salah satu isinya belum ada. Kalau kamu memakai model atau view milik modul lain, modul itu wajib disebut di sini — kalau tidak, pemasangan gagal dengan pesan bahwa model tidak ditemukan, dan penyebabnya sering sulit ditebak."
    tingkat: dasar
  - tipe: pilihan_ganda
    pertanyaan: "Kamu menulis `<xpath expr=\"//field[@name='diskon']\" position=\"after\">` di view warisan, tapi induknya tidak punya field bernama `diskon`. Apa yang terjadi?"
    opsi:
      a: "XPath diabaikan, view lain tetap terpasang"
      b: "Pemasangan modul gagal dengan pesan bahwa elemen xpath tidak bisa ditemukan di view induk"
      c: "Odoo membuat field `diskon` otomatis"
      d: "Field disisipkan di akhir form"
    jawaban: b
    penjelasan: "XPath yang tidak menemukan sasaran adalah kesalahan keras: Odoo tidak bisa menebak maksudmu, jadi ia menolak. Ini disengaja — kalau dibiarkan lewat, kamu akan mendapat form yang tampak baik-baik saja tapi kehilangan field yang kamu kira sudah ditambahkan. Perbaikannya selalu sama: periksa arch induk yang sebenarnya, jangan mengandalkan nama field yang kamu ingat."
    tingkat: menengah
---

## Lapis 1

### Manifest: kartu identitas modul

Setiap modul Odoo adalah satu folder berisi berkas `__manifest__.py`. Isinya satu dict Python:

```python
{
    "name": "Toko",
    "version": "19.0.1.0.0",
    "depends": ["base"],
    "data": [
        "security/ir.model.access.csv",
        "views/produk.xml",
        "views/menu.xml",
    ],
    "installable": True,
    "license": "LGPL-3",
}
```

Empat kunci yang menentukan segalanya:

| Kunci | Artinya |
|---|---|
| `name` | nama yang muncul di daftar Apps |
| `version` | `seri_modul.revisi`, mis. `19.0.1.0.0` — seri harus cocok dengan versi Odoo |
| `depends` | modul yang harus terpasang lebih dulu |
| `data` | berkas yang dimuat saat pemasangan, **berurutan** |

`data` dimuat dari atas ke bawah. Karena itu `security/ir.model.access.csv` ditulis sebelum view: hak akses harus ada sebelum ada yang membuka view-nya. Kalau view disebut lebih dulu, pemasangan gagal pada baris yang membutuhkannya.

Kunci lain yang sering dipakai: `application` (menampilkan modul sebagai aplikasi di menu utama), `auto_install` (terpasang sendiri kalau dependensinya lengkap), `demo` (data contoh, hanya dimuat kalau database dibuat dengan data demo), dan `external_dependencies` (paket Python di luar Odoo).

### Kenapa `.py`, bukan `.json`

Karena manifest adalah **kode Python**, bukan data. Kamu bisa menulis komentar, koma di akhir baris, dan menghitung nilai:

```python
{
    "name": "Toko",
    "version": "19.0." + "1.0.0",
    "depends": ["base"] + (["sale"] if True else []),
}
```

Konsekuensinya: satu tanda kurung salah membuat modul tidak terbaca sama sekali, dan pesan errornya menunjuk berkas manifest, bukan isi yang salah.

### `depends`: urutan, bukan sekadar daftar

`depends` melakukan dua hal:

1. **Syarat** — modul tidak bisa dipasang kalau isinya belum ada.
2. **Urutan** — Odoo menyusun urutan pemasangan dari daftar ini, sehingga model dan view modul yang kamu warisi pasti sudah ada saat modulmu dimuat.

Karena itu, memakai model milik modul lain tanpa menyebutnya di `depends` adalah kesalahan yang mahal: kode tampak benar di laptopmu (modul itu kebetulan sudah terpasang), lalu gagal di server yang bersih.

### Inheritance: menumpang, bukan menyalin

View warisan adalah record `ir.ui.view` dengan `inherit_id` terisi:

```xml
<record id="view_produk_form_diskon" model="ir.ui.view">
  <field name="name">produk.form.diskon</field>
  <field name="model">toko.produk</field>
  <field name="inherit_id" ref="toko.view_produk_form"/>
  <field name="priority">30</field>
  <field name="arch" type="xml">
    <xpath expr="//field[@name='nama']" position="after">
      <field name="diskon"/>
    </xpath>
  </field>
</record>
```

Perhatikan yang **tidak ada**: tidak ada `<form>`, tidak ada `<sheet>`, tidak ada salinan arch induk. Arch-nya hanya berisi perintah penyisipan. Odoo menggabungkannya dengan arch induk saat memuat view.

`ref="toko.view_produk_form"` menunjuk record view induk lewat **external id**: `nama_modul.id_record`. Menulis `ref="view_produk_form"` saja hanya benar kalau view induk ada di modul yang sama.

### `position`: lima cara menyentuh arch induk

| `position` | Akibat |
|---|---|
| `after` | sisipkan setelah elemen yang cocok |
| `before` | sisipkan sebelum elemen yang cocok |
| `inside` | sisipkan sebagai anak terakhir elemen yang cocok |
| `replace` | ganti elemen yang cocok dengan isi xpath |
| `attributes` | ubah atribut elemen, mis. `invisible` |

`attributes` dipakai untuk mengubah sifat elemen yang sudah ada tanpa menyalinnya:

```xml
<xpath expr="//field[@name='harga']" position="attributes">
  <attribute name="readonly">state != 'draft'</attribute>
</xpath>
```

### `priority`: siapa dulu saat beberapa view menyentuh tempat yang sama

Beberapa modul bisa mewarisi view yang sama. `priority` kecil diterapkan lebih dulu. Ini bukan soal selera tampilan — ia menentukan apakah xpath sebuah view menemukan sasarannya:

- View A (priority 10) menyisipkan `pajak` setelah `harga`.
- View B (priority 20) menyisipkan `total` setelah `pajak`.

Kalau B diterapkan lebih dulu, `pajak` belum ada dan xpath-nya gagal. Priority yang benar membuat keduanya berhasil.

### Di pekerjaan, ini dipakai untuk apa

Hampir semua pekerjaan "sesuaikan Odoo untuk perusahaan ini" adalah modul kecil yang mewarisi view dan model milik modul standar. Kamu tidak menyalin Odoo; kamu menulis modul yang menempel padanya, sehingga saat Odoo diperbarui, penyesuaianmu tetap berlaku.

## Lapis 2

### Manifest lengkap: kunci yang layak diketahui

| Kunci | Isi | Catatan |
|---|---|---|
| `name` | teks | boleh bahasa apa pun |
| `summary` | satu baris | tampil di kartu Apps |
| `version` | `seri_modul.revisi` | `19.0.1.0.0` untuk Odoo 19 |
| `depends` | list modul | minimal `["base"]` |
| `data` | list berkas | urut, dimuat saat install & upgrade |
| `demo` | list berkas | hanya untuk database dengan data demo |
| `installable` | bool | `False` menyembunyikan modul dari Apps |
| `application` | bool | `True` = muncul sebagai aplikasi di menu utama |
| `auto_install` | bool | terpasang sendiri saat semua `depends` terpasang |
| `license` | teks | `LGPL-3` untuk modul publik |
| `external_dependencies` | `{"python": ["xlsxwriter"]}` | paket Python yang wajib ada |
| `assets` | dict | berkas JS/CSS untuk backend/frontend |

`external_dependencies` adalah satu-satunya cara sah menyatakan "modul ini butuh paket Python di luar Odoo". Kalau tidak ditulis, gejalanya adalah `ModuleNotFoundError` saat kode dijalankan — jauh dari berkas yang sebenarnya salah.

### Pola xpath yang paling sering dipakai

```xml
<xpath expr="//field[@name='partner_id']" position="after">…</xpath>
<xpath expr="//button[@name='action_confirm']" position="attributes">…</xpath>
<xpath expr="//page[@name='other_info']" position="inside">…</xpath>
<xpath expr="//div[hasclass('oe_title')]" position="before">…</xpath>
<xpath expr="//list/field[@name='price_unit']" position="after">…</xpath>
```

- `@name` adalah atribut yang paling stabil — itu sebabnya field dan button selalu punya `name`.
- `hasclass('...')` adalah fungsi khusus Odoo untuk mencari berdasarkan kelas CSS, karena `contains(@class, ...)` tidak tersedia di parser-nya.
- `//list/field[...]` menyasar field di dalam view list yang bersarang di dalam form (baris pesanan).

Aturan praktis: sasaran yang kamu pilih sebaiknya bukan elemen yang paling mungkin dihapus modul lain. `//field[@name='nama']` lebih tahan lama daripada `//sheet/group[2]/field[1]` — indeks berubah begitu ada modul lain menyisipkan sesuatu.

### Extension vs primary

| | `inherit_id` kosong | `inherit_id` terisi |
|---|---|---|
| Jenis | primary (view baru) | extension (menumpang) |
| Arch | lengkap, berakar `<form>`/`<list>`/`<search>` | hanya `<xpath>` (boleh dibungkus `<data>`) |
| Muncul di pemilih view | ya | tidak — ia selalu ikut induknya |
| Untuk apa | tampilan alternatif, mis. form ringkas untuk kasus khusus | menambah/mengubah tampilan yang sudah ada |

View primary berguna saat kamu butuh tampilan yang benar-benar berbeda untuk model yang sama — misalnya form ringkas yang dibuka dari sebuah tombol. Kalau yang kamu butuhkan hanya "tambah satu field", itu extension.

### Mewarisi model, bukan hanya view

Kunci yang sama berlaku di Python:

```python
from odoo import fields, models


class Produk(models.Model):
    _inherit = "toko.produk"

    diskon = fields.Float(string="Diskon (%)")
    total = fields.Float(compute="_compute_total", store=True)
```

`_inherit` menambahkan field dan method ke model yang sudah ada — tanpa membuat tabel baru, tanpa menyalin field lama. Bandingkan dengan `_name` yang membuat model baru. Menulis keduanya sekaligus berarti model baru yang menumpang pada model lama (dipakai untuk varian khusus).

Sama seperti view: `depends` modul pemilik model asli wajib disebut, atau `_inherit` gagal karena modelnya belum terdaftar.

### Error umum

| Pesan | Arti | Cara memperbaiki |
|---|---|---|
| `Element '<xpath expr="...">' cannot be located in parent view` | XPath tidak menemukan sasaran di arch induk | Periksa arch induk yang sebenarnya; cek `priority`; pastikan induk benar |
| `Field "diskon" does not exist in model "toko.produk"` | View menyebut field yang belum ada di model | Tambahkan field di model, atau perbaiki ejaan |
| `Module toko: invalid manifest` | Dict manifest tidak terbaca | Cek tanda kurung, koma, dan tanda kutip; jalankan `python -c "import ast; ast.parse(open('__manifest__.py').read())"` |
| `Unable to load module toko: dependency not found: report_xlsx` | `depends` menyebut modul yang tidak ada di addons path | Pasang modulnya, atau hapus dari `depends` |
| `KeyError: 'name'` saat memindai addons | Manifest tidak punya kunci wajib | `name` dan `version` wajib ada |
| `The model "toko.produk" does not exist` saat `_inherit` | Modul pemilik model tidak disebut di `depends` | Tambahkan modulnya ke `depends`, lalu upgrade |
| `odoo.tools.convert.ParseError` pada berkas XML | XML tidak well-formed atau record id dobel | Cek tag tertutup; pastikan `id` record unik di modul itu |

### Menaikkan modul setelah mengubah manifest

Setelah menyunting `__manifest__.py` atau XML, modul perlu dinaikkan ulang — memasang ulang dari UI tidak cukup kalau daftar `data` berubah:

```bash
odoo-bin -d namadb -u toko --stop-after-init
```

`-u` (update) memuat ulang manifest dan seluruh berkas `data`. Tanpa itu, Odoo memakai daftar berkas yang tersimpan di database, dan berkas baru tidak pernah dibaca — gejala klasik "perubahanku tidak muncul".

### Daftar periksa sebelum menulis modul warisan

1. `depends` menyebut modul pemilik model dan view yang diwarisi.
2. `version` memakai seri yang cocok dengan versi Odoo (`19.0.…`).
3. `data` berurutan: security dulu, lalu view, lalu menu.
4. `ref` pada `inherit_id` memakai bentuk `modul.id_record`, bukan id polos.
5. XPath menyasar atribut `name`, bukan indeks posisi.
6. `priority` cukup besar kalau menyasar field yang dibuat view warisan lain.
7. Arch view warisan tidak memuat `<form>` atau `<sheet>` — hanya `<xpath>`.
8. Modul dinaikkan dengan `-u`, bukan sekadar dipasang ulang dari UI.

## Latihan

Latihan 1 meniru dua mekanisme yang paling sering menggagalkan pemasangan modul: urutan `depends` dan urutan penerapan `priority` pada xpath. Latihan 2 membuktikan keduanya di database sungguhan — view turunan yang arch-nya hanya berisi `<xpath>`, dan kolom Dependencies modul yang isinya berasal dari manifest.

## Kamu sudah bisa ini kalau…

- [ ] Bisa menjelaskan kenapa manifest ditulis sebagai dict Python, bukan JSON.
- [ ] Tahu apa yang terjadi kalau modul memakai model modul lain tanpa menyebutnya di `depends`.
- [ ] Bisa menyebut tiga `position` pada `<xpath>` dan bedanya.
- [ ] Tahu kenapa `priority` menentukan berhasil atau gagalnya xpath sebuah view warisan.
- [ ] Bisa membedakan view extension dan view primary dari isi arch-nya.
- [ ] Tahu perintah untuk menaikkan modul setelah manifest berubah.
- [ ] Latihan 1 lulus dan latihan 2 berhasil dijalankan.
