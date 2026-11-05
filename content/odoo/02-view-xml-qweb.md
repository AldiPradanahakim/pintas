---
track: odoo
nomor: 2
judul: "View XML & QWeb: mengatur tampilan tanpa menyentuh data"
slug: view-xml-qweb
estimasi_menit: 12
prasyarat:
  - odoo/model-dan-orm
latihan:
  - id: odoo-02-latihan-1
    jenis: web
    bahasa: python
    soal: "Tiru pemeriksaan view Odoo. Diberi daftar field model dan satu arch XML berbentuk form, cetak isi tiap <group> beserta jumlah field-nya, total field di arch, field model yang TIDAK tampil, dan field di arch yang tidak ada di model (salah ketik)."
    kode_awal: |
      import xml.etree.ElementTree as ET

      # field yang benar-benar ada di model
      model = ["kode", "nama", "kategori_id", "harga", "stok", "stok_min", "catatan", "aktif", "berat"]

      # arch view: isi <field name="arch"> dari ir.ui.view
      arch = """
      <form>
        <sheet>
          <group string="Informasi Produk">
            <field name="kode"/>
            <field name="nama"/>
            <field name="kategori_id"/>
            <field name="aktif"/>
          </group>
          <group string="Harga &amp; Stok">
            <field name="harga"/>
            <field name="stok"/>
            <field name="stok_min"/>
          </group>
          <group string="Lainnya">
            <field name="catatan"/>
            <field name="kategor_id"/>
          </group>
        </sheet>
      </form>
      """

      # 1. untuk tiap <group>: cetak "<string group> (<jumlah>): <field, field, ...>"
      # 2. cetak "total field di arch: <n>"
      # 3. cetak "tidak tampil: ..." = field model yang tak disebut di arch
      # 4. cetak "tidak ada di model: ..." = field arch yang tak ada di model
    output_harapan: |
      Informasi Produk (4): kode, nama, kategori_id, aktif
      Harga & Stok (3): harga, stok, stok_min
      Lainnya (2): catatan, kategor_id
      total field di arch: 9
      tidak tampil: berat
      tidak ada di model: kategor_id
    solusi: |
      import xml.etree.ElementTree as ET

      model = ["kode", "nama", "kategori_id", "harga", "stok", "stok_min", "catatan", "aktif", "berat"]

      arch = """
      <form>
        <sheet>
          <group string="Informasi Produk">
            <field name="kode"/>
            <field name="nama"/>
            <field name="kategori_id"/>
            <field name="aktif"/>
          </group>
          <group string="Harga &amp; Stok">
            <field name="harga"/>
            <field name="stok"/>
            <field name="stok_min"/>
          </group>
          <group string="Lainnya">
            <field name="catatan"/>
            <field name="kategor_id"/>
          </group>
        </sheet>
      </form>
      """

      akar = ET.fromstring(arch)
      dipakai = []
      for grup in akar.iter("group"):
          isi = [f.get("name") for f in grup.findall("field")]
          dipakai += isi
          print(f'{grup.get("string")} ({len(isi)}): {", ".join(isi)}')

      print(f"total field di arch: {len(dipakai)}")
      print("tidak tampil:", ", ".join(n for n in model if n not in dipakai) or "-")
      print("tidak ada di model:", ", ".join(n for n in dipakai if n not in model) or "-")
    catatan_solusi: "Inilah yang dilakukan Odoo saat modul dinaikkan: ia membaca arch, mencocokkan tiap <field name=...> dengan field model, lalu menolak view yang menyebut field tidak dikenal. Karena itu typo 'kategor_id' bukan bug tampilan — ia menggagalkan pemasangan modul. Menjalankan pemeriksaan ini di Python dulu jauh lebih cepat daripada menunggu Odoo memberi tahu satu per satu."
  - id: odoo-02-latihan-2
    jenis: laptop
    soal: "Buka database Odoo percobaan, lalu bandingkan arch tiga view berbeda untuk model yang sama. Buktikan bahwa model menentukan data, view menentukan bentuk, dan satu model bisa punya banyak view."
    kebutuhan:
      - "Browser (Chrome/Edge)"
      - "Database Odoo percobaan dari modul 01 (atau buat baru di https://www.odoo.com/start)"
      - "Akses administrator database"
    langkah:
      - perintah: "Login ke database, lalu Settings → gulir ke bawah → klik 'Activate the developer mode'"
        penjelasan: "Mode developer membuka menu Technical. Tanpa ini, seluruh struktur tampilan disembunyikan dari menu."
      - perintah: "Settings → Technical → User Interface → Views"
        penjelasan: "Daftar ini berisi setiap view yang terpasang. Satu baris = satu record ir.ui.view = satu potong XML di database."
      - perintah: "Di kotak pencarian ketik sale.order lalu tekan Enter, perhatikan kolom Type"
        penjelasan: "Untuk satu model yang sama kamu akan melihat beberapa baris: form, list, search, kanban. Masing-masing punya arch sendiri — inilah bukti bahwa model dan view adalah dua hal terpisah."
      - perintah: "Buka baris dengan Type = Form, lalu tab 'Architecture'"
        penjelasan: "Isi tab ini adalah XML yang kamu tulis di modul. Perhatikan <header> untuk tombol status, <sheet> sebagai kertas form, <notebook><page> untuk tab, dan <field name=\"order_line\"> yang di dalamnya berisi <list>."
      - perintah: "Kembali ke daftar view, buka baris dengan Type = List, lihat arch-nya"
        penjelasan: "Arch-nya jauh lebih pendek dan tidak punya <sheet>, <header>, atau <notebook> — hanya <list> berisi <field> per kolom. Elemen yang tersedia berbeda karena tugasnya berbeda."
      - perintah: "Cari 'report_saleorder_document', buka, lihat arch QWeb-nya"
        penjelasan: "Ini template QWeb, bukan view Odoo biasa: berisi t-foreach untuk mengulang baris pesanan dan t-out untuk mencetak nilai. Template inilah yang menghasilkan PDF faktur/penawaran."
    hasil: |
      Daftar Views untuk sale.order memuat beberapa baris dengan Type berbeda:
        sale.order  form    (arch memuat <header>, <sheet>, <notebook>)
        sale.order  list    (arch memuat <list> + <field> per kolom)
        sale.order  search  (arch memuat <search>, <filter>)
        sale.order  kanban  (arch memuat <kanban>, <templates>)
      report_saleorder_document: arch QWeb dengan t-foreach dan t-out
    cek_berhasil:
      - "Satu model (sale.order) menampilkan minimal tiga baris view dengan Type berbeda"
      - "Arch view form memuat <header> dan <notebook>, arch view list tidak"
      - "Template QWeb laporan ditemukan dan memakai t-foreach"
    kalau_gagal:
      - error: "Menu 'Technical' tidak muncul di Settings"
        arti: "Mode developer belum aktif atau halaman belum dimuat ulang."
        perbaikan:
          - "Muat ulang halaman dengan Ctrl+R setelah mengaktifkan mode developer"
          - "Di versi lebih baru tautannya ada di Settings → Developer Tools"
          - "Pastikan login sebagai administrator database, bukan user biasa"
      - error: "Pencarian 'sale.order' tidak menemukan baris apa pun"
        arti: "Kotak pencarian memfilter dengan kata lain, atau modul Sales tidak terpasang di database itu."
        perbaikan:
          - "Hapus isi kotak pencarian, tekan Enter, lalu cari manual di halaman daftar"
          - "Pasang modul Sales lewat Apps, tunggu sampai selesai, ulangi"
          - "Coba model lain yang pasti ada, mis. res.partner"
      - error: "Tab 'Architecture' berisi XML tapi tidak bisa disunting / muncul 'The view cannot be edited'"
        arti: "Kamu membuka view milik modul lain dalam mode baca, atau mode developer belum aktif."
        perbaikan:
          - "Untuk sekadar memeriksa, mode baca sudah cukup — tidak perlu menyunting"
          - "Aktifkan mode developer, lalu buka lewat ikon Developer tools → 'Edit View: Form'"
      - error: "report_saleorder_document tidak ditemukan"
        arti: "Template laporan hanya ada kalau modul Sales terpasang, dan namanya bisa berbeda antar versi."
        perbaikan:
          - "Saring daftar Views dengan Type = QWeb, lalu telusuri manual"
          - "Cari kata 'report' di kotak pencarian untuk melihat template laporan yang tersedia"
    buktikan:
      perubahan: "Buka arch view search untuk sale.order, lalu bandingkan dengan arch view form."
      hasil_diharapkan: "View search berisi <search> dengan <field> dan <filter>, tanpa <sheet> atau <header>. Tiga view, satu model, tiga arch berbeda — data tetap sama di database, hanya cara menampilkannya yang berubah."
kuis:
  - tipe: pilihan_ganda
    pertanyaan: "Apa yang terjadi kalau arch view menyebut `<field name=\"kategor_id\"/>` padahal field model bernama `kategori_id`?"
    opsi:
      a: "Field diabaikan diam-diam, view tetap jalan"
      b: "Modul gagal dinaikkan dengan pesan bahwa field itu tidak ada di model"
      c: "Odoo membuat kolom baru bernama kategor_id"
      d: "View tampil kosong tanpa pesan apa pun"
    jawaban: b
    penjelasan: "Odoo memvalidasi arch terhadap field model saat view disimpan atau modul dinaikkan, dan menolak nama yang tidak dikenal. Ini disengaja: view yang menyebut field hantu adalah bug yang harus ketahuan saat pemasangan, bukan saat pengguna membuka form di depan pelanggan."
    tingkat: dasar
  - tipe: pilihan_ganda
    pertanyaan: "Kenapa satu model bisa punya view form, list, dan search sekaligus?"
    opsi:
      a: "Karena Odoo menyimpan salinan data untuk tiap view"
      b: "Karena view adalah record terpisah yang menunjuk model yang sama, masing-masing dengan arch sendiri"
      c: "Karena form dan list memakai tabel database berbeda"
      d: "Karena search view dihasilkan otomatis dan tidak bisa diubah"
    jawaban: b
    penjelasan: "Model menentukan data dan aturan; view hanya menentukan cara menampilkannya. Setiap view adalah record ir.ui.view dengan field model, type, dan arch. Karena terpisah, kamu bisa menambah view baru untuk model yang sama tanpa menyentuh model maupun view lain."
    tingkat: dasar
  - tipe: pilihan_ganda
    pertanyaan: "Di template QWeb laporan, apa beda `t-out` dan `t-field`?"
    opsi:
      a: "Keduanya sama, hanya nama berbeda antar versi"
      b: "`t-out` mencetak nilai Python apa adanya (dengan escape), `t-field` mencetak field record dengan format bawaannya (tanggal, uang, satuan)"
      c: "`t-field` hanya untuk teks, `t-out` hanya untuk angka"
      d: "`t-out` menulis ke database, `t-field` hanya membaca"
    jawaban: b
    penjelasan: "`t-field` menerima record dan nama field, lalu memakai widget dan format field itu — tanggal jadi '05/11/2026', uang jadi 'Rp 1.250.000,00'. `t-out` mencetak nilai yang sudah kamu siapkan sendiri dan melakukan escape HTML. Untuk laporan, `t-field` lebih sedikit kode dan konsisten dengan tampilan di layar."
    tingkat: menengah
  - tipe: isian_singkat
    pertanyaan: "Nama field pada ir.ui.view yang berisi XML tampilannya adalah ... (satu kata)"
    jawaban: "arch"
    penjelasan: "Setiap view menyimpan XML-nya di field `arch`. Karena itu 'mengubah tampilan' di Odoo berarti mengubah isi arch — baik dengan menyunting view langsung maupun menambah view warisan yang menyisipkan elemen lewat xpath."
    tingkat: dasar
  - tipe: pilihan_ganda
    pertanyaan: "Kamu ingin tombol hanya bisa diklik saat status record 'draft'. Di Odoo 17 ke atas, cara yang benar adalah…"
    opsi:
      a: "`attrs=\"{'invisible': [('state', '!=', 'draft')]}\"`"
      b: "`invisible=\"state != 'draft'\"` sebagai atribut langsung pada elemen"
      c: "Menulis Python di dalam arch dengan `if state == 'draft'`"
      d: "Membuat view terpisah untuk tiap status"
    jawaban: b
    penjelasan: "Odoo 17 menghapus `attrs` dan menggantinya dengan atribut langsung berisi ekspresi: `invisible`, `readonly`, `required`, `column_invisible`. Ekspresi itu dievaluasi di browser setiap kali field yang disebut berubah, jadi tampilan bereaksi tanpa memuat ulang halaman. `attrs` masih muncul di banyak tutorial lama dan akan ditolak versi baru."
    tingkat: lanjutan
---

## Lapis 1

### Dua hal yang terpisah: data dan bentuknya

Modul sebelumnya berhenti pada model. Model menentukan **data apa** yang disimpan. View menentukan **bagaimana data itu ditampilkan dan diubah**.

Karena keduanya terpisah, satu model bisa punya banyak tampilan sekaligus:

| Type view | Untuk apa |
|---|---|
| `form` | satu record, diisi dan disunting |
| `list` | banyak record, satu baris per record |
| `search` | kotak pencarian, filter, dan pengelompokan |
| `kanban` | kartu, sering dipakai untuk alur kerja |
| `graph` / `pivot` | ringkasan angka |
| `calendar` | sebaran berdasarkan tanggal |

Semuanya menunjuk model yang sama. Menambah view baru tidak mengubah data, dan mengubah model tidak merusak view — selama nama field yang disebut tetap ada.

### View adalah record, bukan berkas

Di Odoo, view adalah baris di tabel `ir.ui.view`. Field yang penting:

| Field | Isi |
|---|---|
| `name` | nama untuk manusia, mis. `produk.form` |
| `model` | model yang ditampilkan, mis. `toko.produk` |
| `type` | `form`, `list`, `search`, dan seterusnya |
| `arch` | XML tampilannya — inti dari semuanya |
| `inherit_id` | view induk, kalau view ini mewarisi view lain |
| `priority` | urutan saat beberapa view bersaing jadi default |

Menulis view di modul berarti menulis record ini dalam XML, bukan mengklik di layar. Hasil akhirnya sama.

### Arch form: kerangka yang selalu sama

```xml
<record id="view_produk_form" model="ir.ui.view">
  <field name="name">produk.form</field>
  <field name="model">toko.produk</field>
  <field name="arch" type="xml">
    <form>
      <header>
        <button name="action_arsip" string="Arsipkan" type="object"/>
      </header>
      <sheet>
        <group string="Informasi Produk">
          <field name="kode"/>
          <field name="nama"/>
        </group>
        <notebook>
          <page string="Harga">
            <field name="harga"/>
          </page>
        </notebook>
      </sheet>
    </form>
  </field>
</record>
```

Baris demi baris:
- `<record ... model="ir.ui.view">` — menulis satu baris di tabel view.
- `<field name="model">` — model yang ditampilkan; nama field di dalam arch harus ada di model ini.
- `<field name="arch" type="xml">` — pembungkus XML tampilannya. Atribut `type="xml"` wajib, tanpanya Odoo menganggapnya teks biasa.
- `<form>` — akar arch untuk view bertipe form.
- `<header>` — tempat tombol aksi dan statusbar, muncul di atas kertas.
- `<sheet>` — "kertas" form; hampir semua isi ada di dalamnya.
- `<group string="...">` — dua kolom label–nilai, dikelompokkan dengan judul.
- `<notebook><page>` — tab; tiap `page` jadi satu tab.

### Tiga aturan yang menentukan arch diterima atau ditolak

1. **Setiap `<field name>` harus ada di model.** Salah ketik = modul gagal dipasang, bukan sekadar tampilan aneh.
2. **Akar arch harus sesuai tipenya.** View `form` berakar `<form>`, `list` berakar `<list>` (di Odoo 17 ke atas; versi lama memakai `<tree>`), `search` berakar `<search>`.
3. **XML harus well-formed.** Satu tag tidak tertutup menggagalkan seluruh modul, dan pesan errornya menunjuk berkas, bukan baris yang salah.

### Kenapa XML, bukan kode tampilan

Karena arch adalah **data**, bukan program. Akibatnya:

- Bisa diwarisi: modul lain menyisipkan elemen ke view yang sudah ada tanpa menyalinnya (dibahas di modul 03).
- Bisa diperiksa dan diubah dari UI dalam mode developer.
- Bisa dibandingkan antar versi dengan `git diff` seperti berkas biasa.

Konsekuensi yang perlu diingat: karena arch hanya data, ia tidak bisa memuat logika. Kalau butuh perhitungan, perhitungannya ada di model (`compute`), dan view hanya menampilkan hasilnya.

### QWeb: bahasa template yang berbeda

View mengatur tampilan **di layar**. Untuk keluaran **di luar layar** — PDF faktur, email, laporan — Odoo memakai QWeb.

Bedanya mendasar: arch view menyebut nama field dan Odoo yang mengurus sisanya. QWeb adalah template yang benar-benar dieksekusi, dengan perulangan dan kondisi:

```xml
<template id="report_produk">
  <t t-call="web.html_container">
    <t t-foreach="docs" t-as="produk">
      <h2 t-out="produk.nama"/>
      <p>Harga: <span t-field="produk.harga"/></p>
    </t>
  </t>
</template>
```

- `t-foreach` + `t-as` — mengulang blok untuk setiap record, dengan nama `produk` di dalam blok.
- `t-out` — mencetak nilai dengan escape HTML.
- `t-field` — mencetak field record memakai format bawaannya (tanggal, uang, satuan).

Karena QWeb dieksekusi, ia bisa gagal saat dijalankan — bukan saat dipasang. Itu sebabnya error QWeb muncul sebagai halaman error, bukan penolakan modul.

### Di pekerjaan, ini dipakai untuk apa

Hampir setiap permintaan "tambahkan kolom ini di form pelanggan" atau "ubah tampilan daftar faktur" diselesaikan dengan menyentuh arch, bukan model. Ini pekerjaan yang paling sering diminta dan paling cepat dikerjakan — asalkan kamu tahu nama field yang benar dan tahu view mana yang sedang dipakai.

## Lapis 2

### Elemen arch yang paling sering dipakai

| Elemen | Tempat | Gunanya |
|---|---|---|
| `<header>` | form | tombol aksi, statusbar |
| `<sheet>` | form | kertas form |
| `<group>` | form | pasangan label–nilai, dua kolom |
| `<notebook>` / `<page>` | form | tab |
| `<list>` | list & dalam form | tabel; tiap `<field>` satu kolom |
| `<search>` | search | `<field>`, `<filter>`, `<separator>`, `<group>` |
| `<kanban>` | kanban | kartu; `<templates>` untuk isi kartu |
| `<div>` / `<h1>` / `<p>` | form, QWeb | teks dan tata letak bebas |

### Atribut pada `<field>`

| Atribut | Arti |
|---|---|
| `widget` | cara render: `many2one`, `statusbar`, `monetary`, `badge`, `progressbar`, `priority` |
| `invisible` | ekspresi; `"1"` = selalu sembunyi, tapi nilainya tetap dikirim ke browser |
| `readonly` | ekspresi; tidak bisa diubah, tetap tampil |
| `required` | ekspresi; wajib diisi (menambah aturan model, bukan menggantikannya) |
| `domain` | batas pilihan untuk field relasi |
| `context` | nilai awal saat membuat record dari field itu |
| `options` | pengaturan khusus widget, ditulis sebagai dict |
| `colspan` | lebar dalam kolom grid form |

`invisible="1"` adalah trik yang sering dipakai dan sering disalahpahami: field yang tidak perlu dilihat tapi dibutuhkan di layar (untuk `domain`, `context`, atau supaya ikut terkirim) tetap ditulis dengan `invisible="1"`, bukan dihapus.

### Odoo 17: `attrs` diganti atribut langsung

Tutorial lama menulis:

```xml
<field name="harga" attrs="{'readonly': [('state', '!=', 'draft')]}"/>
```

Di Odoo 17 ke atas bentuknya:

```xml
<field name="harga" readonly="state != 'draft'"/>
```

`attrs` dihapus. Ekspresinya kini Python yang dievaluasi di browser setiap kali field yang disebut berubah — jadi tampilan bereaksi tanpa memuat ulang halaman. Kalau mengikuti tutorial lama dan hasilnya error, ini penyebabnya.

Hal serupa terjadi pada `<tree>` yang menjadi `<list>`. Nama lama masih diterima di beberapa versi sebagai alias, tapi kode baru sebaiknya memakai `<list>`.

### Anatomi view list

```xml
<list string="Produk" decoration-danger="stok &lt; stok_min" create="0">
  <field name="kode"/>
  <field name="nama"/>
  <field name="harga" sum="Total"/>
  <field name="stok"/>
  <button name="action_isi_ulang" type="object" icon="fa-refresh"/>
</list>
```

- `decoration-danger` (juga `-warning`, `-info`, `-muted`, `-success`) — mewarnai baris berdasarkan ekspresi.
- `sum="..."` pada field angka — menambah baris total di bawah.
- `create="0"` — menyembunyikan tombol buat; sering dipakai untuk view yang hanya untuk dilihat.
- `<button>` di dalam list — aksi per baris.

### View search: yang membuat data besar bisa dipakai

```xml
<search>
  <field name="nama"/>
  <field name="kategori_id"/>
  <filter name="stok_habis" string="Stok habis"
          domain="[('stok', '&lt;', stok_min)]"/>
  <group expand="0" string="Grup">
    <filter name="per_kategori" string="Kategori"
            context="{'group_by': 'kategori_id'}"/>
  </group>
</search>
```

`domain` pada filter adalah kondisi yang ditambahkan saat filter diklik. `context` dengan `group_by` mengubah hasil jadi ringkasan per nilai — cara termurah membuat laporan tanpa menulis kode.

### QWeb: direktif yang perlu dihafal

| Direktif | Arti |
|---|---|
| `t-foreach` / `t-as` | ulangi elemen untuk tiap item |
| `t-if` / `t-elif` / `t-else` | tampilkan bersyarat |
| `t-out` | cetak nilai, escape HTML |
| `t-field` | cetak field record dengan formatnya |
| `t-call` | panggil template lain (dipakai untuk header/footer laporan) |
| `t-set` | menyimpan nilai ke variabel template |
| `t-att-*` | isi atribut HTML dari nilai dinamis |

Aturan praktisnya: `t-field` untuk field record, `t-out` untuk nilai lain. `t-raw` sudah tidak dipakai — `t-out` menangani keduanya dengan aman.

Laporan lengkap terdiri dari tiga bagian: template QWeb, `paperformat` (ukuran kertas dan margin), dan action yang memanggilnya. Kalau PDF keluar kosong, biasanya yang salah adalah `docs` — variabel yang harus diisi recordset oleh action.

### Error umum

| Pesan | Arti | Cara memperbaiki |
|---|---|---|
| `Field "kategor_id" used in view produk.form does not exist` | Arch menyebut field yang tidak ada di model | Perbaiki ejaan; cek nama field di model |
| `Element '<xpath expr="...">' cannot be located in parent view` | XPath pada view warisan tidak menemukan sasaran | Periksa arch induk; pastikan induk yang benar dan sudah terpasang |
| `Invalid XML: mismatched tag` | Tag tidak tertutup atau bersarang salah | Rapikan XML; satu akar per arch |
| `The element '<tree>' cannot be located` | Memakai `<tree>` pada versi yang menuntut `<list>` | Ganti ke `<list>` |
| `QWebException: ... while evaluating` | Template gagal saat dijalankan, biasanya nama variabel salah | Cek `t-foreach`/`t-as` dan nama field di template |
| `odoo.tools.convert.ParseError` | Gagal memuat berkas XML modul | Pesannya menyebut berkas; buka dan cek sekitar elemen yang disebut |

### Performa: dua hal yang mahal di view

1. **Field computed tanpa `store=True` di dalam list.** Dihitung per baris, per halaman. Pada 80 baris itu 80 perhitungan; kalau perhitungannya memanggil `search()`, jumlahnya berlipat.
2. **`domain` pada field relasi yang memakai field computed tak tersimpan.** Domain dikirim ke database; kalau isinya tidak bisa dihitung di database, Odoo terpaksa memuat lebih banyak dari yang perlu.

Aturan sederhananya: yang tampil di list sebaiknya kolom nyata di database.

### Daftar periksa sebelum menulis view

1. Nama field sudah dicocokkan dengan model — bukan dikira-kira.
2. Akar arch sesuai tipe view (`form`, `list`, `search`, `kanban`).
3. Memakai atribut langsung (`invisible`, `readonly`), bukan `attrs`, untuk Odoo 17 ke atas.
4. Setiap field yang hanya dipakai untuk `domain`/`context` ditulis `invisible="1"`, bukan dihapus.
5. Tidak ada logika di arch — perhitungan ada di model.
6. View yang diwarisi disebut lewat `inherit_id` dengan `ref` yang benar, bukan disalin.
7. Sudah dibuka di browser dengan mode developer: yang salah ketik tidak selalu gagal, kadang hanya tidak muncul.

## Latihan

Latihan 1 meniru validasi yang dilakukan Odoo: mencocokkan setiap `<field name>` di arch dengan daftar field model, sehingga salah ketik ketahuan dalam hitungan detik. Latihan 2 membuka database sungguhan dan membandingkan arch tiga view berbeda untuk satu model yang sama — bukti paling jelas bahwa model dan view adalah dua lapis terpisah.

## Kamu sudah bisa ini kalau…

- [ ] Bisa menjelaskan kenapa satu model bisa punya view form, list, dan search sekaligus.
- [ ] Tahu field mana pada `ir.ui.view` yang berisi XML tampilannya.
- [ ] Bisa menyebut tiga elemen wajib sebuah arch form dan gunanya.
- [ ] Tahu beda `t-out` dan `t-field`, dan kapan memakai masing-masing.
- [ ] Tahu kenapa `attrs` tidak lagi dipakai di Odoo 17 ke atas.
- [ ] Latihan 1 lulus dan latihan 2 berhasil dijalankan.
