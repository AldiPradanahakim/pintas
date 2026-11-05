---
track: odoo
nomor: 1
judul: "Odoo: model & ORM"
slug: model-dan-orm
estimasi_menit: 12
prasyarat:
  - fondasi/sql
latihan:
  - id: odoo-01-latihan-1
    jenis: web
    bahasa: python
    soal: "Tiru cara kerja domain Odoo. Diberi daftar partner dan satu domain berisi kondisi (field, operator, nilai), saring record yang memenuhi SEMUA kondisi, cetak jumlahnya, tiap record sebagai '<nama>: <piutang>', lalu total piutangnya."
    kode_awal: |
      partner = [
          {"nama": "Toko Sinar Jaya", "kota": "Bandung", "piutang": 1250000},
          {"nama": "CV Mitra Abadi", "kota": "Surabaya", "piutang": 0},
          {"nama": "UD Sumber Rejeki", "kota": "Bandung", "piutang": 480000},
          {"nama": "PT Karya Utama", "kota": "Jakarta", "piutang": 3150000},
          {"nama": "Toko Berkah", "kota": "Bandung", "piutang": 950000},
      ]

      # domain Odoo: daftar kondisi (field, operator, nilai), digabung DAN
      domain = [("kota", "=", "Bandung"), ("piutang", ">", 0)]

      # 1. saring: record harus memenuhi SEMUA kondisi
      # 2. cetak jumlah, tiap record, lalu total
    output_harapan: |
      3 record
      Toko Sinar Jaya: 1250000
      UD Sumber Rejeki: 480000
      Toko Berkah: 950000
      total: 2680000
    solusi: |
      partner = [
          {"nama": "Toko Sinar Jaya", "kota": "Bandung", "piutang": 1250000},
          {"nama": "CV Mitra Abadi", "kota": "Surabaya", "piutang": 0},
          {"nama": "UD Sumber Rejeki", "kota": "Bandung", "piutang": 480000},
          {"nama": "PT Karya Utama", "kota": "Jakarta", "piutang": 3150000},
          {"nama": "Toko Berkah", "kota": "Bandung", "piutang": 950000},
      ]

      domain = [("kota", "=", "Bandung"), ("piutang", ">", 0)]


      def cocok(record, domain):
          for field, op, nilai in domain:
              if op == "=" and record[field] != nilai:
                  return False
              if op == ">" and not record[field] > nilai:
                  return False
          return True


      hasil = [p for p in partner if cocok(p, domain)]
      print(f"{len(hasil)} record")
      for p in hasil:
          print(f"{p['nama']}: {p['piutang']}")
      print(f"total: {sum(p['piutang'] for p in hasil)}")
    catatan_solusi: "Domain Odoo bentuknya persis begini: daftar tuple (field, operator, nilai) yang digabung dengan DAN. Bedanya, Odoo menerjemahkannya menjadi klausa WHERE dan mengerjakannya di database — bukan menyaring di Python setelah semua record diambil. Itu sebabnya search() tetap cepat pada tabel berisi ratusan ribu baris."
  - id: odoo-01-latihan-2
    jenis: laptop
    soal: "Buka database Odoo percobaan, aktifkan mode developer, lalu buka daftar model dan periksa field model res.partner. Buktikan bahwa satu field bisa menunjuk ke model lain, bukan menyimpan teks."
    kebutuhan:
      - "Browser (Chrome/Edge)"
      - "Email aktif untuk membuat database percobaan Odoo"
    langkah:
      - perintah: "Buka https://www.odoo.com/start lalu isi email"
        penjelasan: "Odoo membuat database percobaan (trial) atas namamu. Tidak perlu kartu kredit; database ini berisi data contoh, bukan kosong."
      - perintah: "Buka Settings, gulir ke bawah, klik 'Activate the developer mode'"
        penjelasan: "Mode developer membuka menu Technical. Tanpa ini, bagian struktur database disembunyikan dari menu biasa. Tautan yang sama juga ada di menu Developer Tools pada versi yang lebih baru."
      - perintah: "Settings → Technical → Database Structure → Models"
        penjelasan: "Ini daftar seluruh model yang terpasang. Satu baris = satu kelas Python = satu tabel di database."
      - perintah: "Cari 'res.partner' di kotak pencarian, lalu buka barisnya"
        penjelasan: "res.partner adalah model induk untuk semua pihak: pelanggan, vendor, kontak. Banyak model lain menumpang di atasnya."
      - perintah: "Buka tab 'Fields', cari baris name, email, country_id, is_company"
        penjelasan: "Kolom 'Type' menunjukkan jenis tiap field. Perhatikan country_id: tipenya Many2one ke res.country, bukan Char — yang disimpan di tabel hanya id negaranya."
      - perintah: "Buka model 'res.users', cari field 'partner_id'"
        penjelasan: "User pun menunjuk ke res.partner lewat Many2one. Inilah cara Odoo menyimpan hubungan antar model: id, bukan salinan data."
    hasil: |
      Daftar model dengan kolom Model, Description, Transient
      Halaman res.partner, tab Fields berisi antara lain:
        name          Char
        email         Char
        country_id    Many2one   → res.country
        is_company    Boolean
      Di res.users: partner_id   Many2one   → res.partner
    cek_berhasil:
      - "Menu Technical muncul di Settings setelah mode developer aktif"
      - "res.partner ditemukan dan halaman detailnya terbuka"
      - "country_id bertipe Many2one ke res.country, bukan Char"
    kalau_gagal:
      - error: "Menu 'Technical' tidak ada di Settings"
        arti: "Mode developer belum aktif, atau halaman belum dimuat ulang."
        perbaikan:
          - "Muat ulang halaman (Ctrl+R) setelah mengaktifkan mode developer"
          - "Di beberapa versi tautannya ada di menu Settings → Developer Tools"
          - "Pastikan login sebagai administrator database, bukan user biasa"
      - error: "Halaman menampilkan 'Access Denied' atau 'You are not allowed to access this document'"
        arti: "Akun yang dipakai bukan administrator, jadi menu struktur database ditutup."
        perbaikan:
          - "Login dengan akun yang membuat database (pemilik trial = admin)"
          - "Kalau memakai database demo bersama, buat database percobaan sendiri"
      - error: "Situs menampilkan 502 / 'database is being created'"
        arti: "Database percobaan masih dibuat di server Odoo; butuh beberapa menit."
        perbaikan:
          - "Tunggu, lalu muat ulang halaman"
          - "Cek email — tautan database dikirim ke alamat yang kamu isi"
      - error: "Pencarian 'res.partner' tidak menemukan apa pun"
        arti: "Kotak pencarian sedang memfilter dengan kata lain, atau kamu berada di tab yang salah."
        perbaikan:
          - "Hapus isi kotak pencarian, tekan Enter"
          - "Pastikan berada di halaman Models, bukan Fields atau Views"
    buktikan:
      perubahan: "Dari halaman res.partner, buka tab 'Views' lalu cari view bertipe 'form'."
      hasil_diharapkan: "Ada beberapa view (form, list, search) untuk model yang sama. Satu model bisa punya banyak tampilan — model mengatur data, view mengatur cara menampilkannya. Modul berikutnya membahas view itu."
kuis:
  - tipe: pilihan_ganda
    pertanyaan: "Apa yang dihasilkan `self.env['res.partner'].search([('is_company', '=', True)])`?"
    opsi:
      a: "Daftar dict berisi semua kolom tiap partner"
      b: "Recordset berisi id partner yang cocok, bisa diakses seperti objek"
      c: "Query SQL dalam bentuk teks"
      d: "Jumlah partner yang cocok"
    jawaban: b
    penjelasan: "search() mengembalikan recordset: kumpulan record yang tahu model dan id-nya. Kamu bisa langsung menulis `for p in hasil: p.name`, dan Odoo mengambil field itu dari cache atau database. Untuk sekadar menghitung, pakai search_count() supaya tidak perlu memuat recordnya."
    tingkat: dasar
  - tipe: pilihan_ganda
    pertanyaan: "Field `country_id` pada res.partner bertipe Many2one ke res.country. Apa yang benar-benar tersimpan di kolom tabel res_partner?"
    opsi:
      a: "Nama negara sebagai teks"
      b: "Id record negara di tabel res_country"
      c: "Kode negara dua huruf"
      d: "Seluruh data negara dalam bentuk JSON"
    jawaban: b
    penjelasan: "Many2one menyimpan foreign key: satu kolom berisi id. Nama negara diambil saat ditampilkan, jadi kalau nama negara diubah, semua partner ikut menampilkan nama baru tanpa update massal. Ini juga alasan menghapus negara yang masih dipakai partner ditolak oleh database."
    tingkat: dasar
  - tipe: pilihan_ganda
    pertanyaan: "Kenapa menulis SQL langsung ke tabel Odoo (mis. UPDATE res_partner SET ...) berbahaya, padahal hasilnya terlihat benar?"
    opsi:
      a: "Karena SQL lebih lambat daripada ORM"
      b: "Karena aturan akses, multi-perusahaan, cache, dan field terhitung tidak ikut dijalankan"
      c: "Karena Odoo tidak memakai PostgreSQL"
      d: "Karena SQL tidak bisa menulis ke tabel Odoo"
    jawaban: b
    penjelasan: "ORM menjalankan lapisan yang tidak terlihat: hak akses per record, penyaringan company, cache yang harus dibersihkan, field computed yang perlu dihitung ulang, dan constraint. Query SQL langsung melewati semuanya — data jadi tidak konsisten, dan cache menampilkan nilai lama sampai server di-restart."
    tingkat: menengah
  - tipe: isian_singkat
    pertanyaan: "Atribut kelas yang menentukan nama teknis model (dan nama tabelnya) di Odoo adalah _name = '...'. Tulis nama atribut itu tanpa tanda kutip."
    jawaban: "_name"
    penjelasan: "_name adalah nama teknis model, ditulis dengan titik seperti 'res.partner' dan otomatis menjadi nama tabel dengan titik diganti garis bawah: res_partner. Ini yang membuat model bisa diwarisi dari modul lain tanpa menyentuh kode aslinya."
    tingkat: dasar
  - tipe: pilihan_ganda
    pertanyaan: "Kamu ingin menambah dua field ke model bawaan `res.partner` tanpa membuat tabel baru. Mana yang benar?"
    opsi:
      a: "_name = 'res.partner' pada kelas baru"
      b: "_inherit = 'res.partner' tanpa _name"
      c: "_inherits = 'res.partner'"
      d: "Menyalin seluruh kode res.partner ke modulmu"
    jawaban: b
    penjelasan: "_inherit tanpa _name berarti mewarisi model yang sudah ada: field baru ditambahkan ke tabel res_partner yang sama. _inherits (dengan s) adalah pewarisan delegasi — model baru punya tabel sendiri dan menautkan record induknya lewat Many2one. Menulis _name yang sama tanpa _inherit justru dianggap model lain dan ditolak."
    tingkat: lanjutan
---

## Lapis 1

### Model adalah kelas Python; tabel adalah akibatnya

Di Odoo kamu tidak membuat tabel. Kamu membuat **model**: satu kelas Python yang mendeklarasikan nama dan field-nya. Odoo yang menerjemahkannya menjadi tabel dan kolom saat modul dipasang.

```python
from odoo import models, fields


class Partner(models.Model):
    _name = "res.partner"
    _description = "Kontak"

    name = fields.Char(required=True)
    email = fields.Char()
    is_company = fields.Boolean()
    country_id = fields.Many2one("res.country")
    credit_limit = fields.Monetary(currency_field="currency_id")
```

Baris demi baris:
- `_name = "res.partner"` — nama teknis model; titiknya menjadi garis bawah pada nama tabel: `res_partner`.
- `name = fields.Char(required=True)` — kolom teks wajib. `required` menjadi NOT NULL di database.
- `country_id = fields.Many2one("res.country")` — kolom yang berisi **id** record negara, bukan teks nama negara.
- `credit_limit` — angka uang; `currency_field` menunjuk field mata uang supaya formatnya benar di layar.

Perhatikan: tidak ada `CREATE TABLE` di mana pun. Struktur tabel dihasilkan dari deklarasi ini, dan saat kamu menambah field lalu menaikkan modul, Odoo yang menambahkan kolomnya.

### Field mendeklarasikan perilaku, bukan cuma tipe

Field bukan sekadar kolom. Ia membawa aturan: `required` (tidak boleh kosong), `default` (nilai awal), `compute` (dihitung, bukan diisi), `readonly`, `index`, dan `tracking` (masuk riwayat perubahan). Karena aturan itu ada di satu tempat, validasi tidak perlu ditulis ulang di setiap form.

### Recordset, bukan list

Hasil `search()` bukan daftar dict. Ia **recordset**: kumpulan record dari satu model yang bisa dioperasikan bersama.

```python
partner = self.env["res.partner"]
perusahaan = partner.search([("is_company", "=", True), ("country_id.code", "=", "ID")])
print(len(perusahaan))            # jumlah record
print(perusahaan.mapped("name"))  # satu field dari semua record
print(perusahaan[0].name)         # record pertama, lalu field-nya
perusahaan.write({"credit_limit": 0})  # menulis ke SEMUA record sekaligus
```

Tiga hal yang sering mengejutkan pemula:
- Recordset kosong tetap recordset. `for` di atasnya tidak error, hanya tidak berjalan — jadi tidak perlu cek `if hasil is not None`.
- Operasi pada recordset berlaku untuk semua anggotanya. `write()` di atas menyentuh setiap record, bukan satu.
- `+` menggabungkan dua recordset dan membuang duplikat; `&` mengiris irisan.

### Empat operasi yang membentuk hampir semua kode Odoo

| Operasi | Arti | Bentuk |
|---|---|---|
| `search(domain)` | ambil record yang cocok | `search([("state", "=", "sale")], limit=10)` |
| `create(vals)` | buat satu record | `create({"name": "Toko Baru"})` |
| `write(vals)` | ubah record di recordset | `rec.write({"phone": "..."})` |
| `unlink()` | hapus record | `rec.unlink()` |

`browse(id)` melengkapi keempatnya: mengambil record dari id yang sudah kamu punya, tanpa query tambahan kalau sudah ada di cache.

### Domain: kondisi penyaringan

Domain adalah daftar kondisi, tiap kondisi berupa tuple `(field, operator, nilai)`:

```python
[("is_company", "=", True), ("credit_limit", ">", 0)]
```

Semua kondisi digabung dengan DAN. Untuk ATAU, pakai operator `|` di depan dua kondisi — bentuk prefix yang terasa aneh tapi konsisten:

```python
["|", ("city", "=", "Bandung"), ("city", "=", "Jakarta")]
```

Domain inilah yang membuat penyaringan terjadi di database. Menyaring di Python setelah mengambil semua baris bekerja untuk data kecil, lalu berhenti bekerja saat data tumbuh — dan itulah kesalahan performa paling umum di modul Odoo.

### Kenapa ORM, bukan SQL langsung

ORM menjalankan lapisan yang tidak terlihat saat kamu menulis query sendiri: hak akses per record, penyaringan multi-perusahaan, cache, field computed, constraint, dan pesan error yang bisa dibaca pengguna. Query SQL langsung melewati semua itu.

Konsekuensi praktisnya: data bisa tampak benar di database tapi salah di layar (cache lama), atau bocor antar perusahaan (filter company terlewat). Kalau benar-benar butuh SQL, tulis di `self.env.cr.execute()` dan sadari kamu mengambil alih tanggung jawab itu.

### Di pekerjaan, ini dipakai untuk apa

Hampir setiap penyesuaian Odoo dimulai dari sini: menambah field ke model yang sudah ada (`x_catatan_internal` pada `sale.order`), atau membuat model baru untuk data yang belum ditampung ERP. Keduanya dikerjakan dengan kelas Python seperti di atas, bukan dengan mengubah tabel lewat pgAdmin.

## Lapis 2

### Tipe field yang paling sering dipakai

| Field | Isi | Catatan |
|---|---|---|
| `Char` | teks pendek | `size` opsional; jangan untuk teks panjang |
| `Text` | teks panjang | tanpa batas praktis |
| `Integer` / `Float` | angka | `Float` butuh `digits` untuk presisi uang |
| `Monetary` | uang | wajib `currency_field` |
| `Boolean` | benar/salah | disimpan sebagai kolom nullable |
| `Date` / `Datetime` | tanggal / waktu | `Datetime` disimpan dalam UTC |
| `Selection` | pilihan tetap | dideklarasikan sebagai list tuple |
| `Many2one` | menunjuk satu record | menyimpan id; `ondelete` menentukan nasib saat induk dihapus |
| `One2many` | anak dari induk | field virtual: tidak ada kolomnya di tabel |
| `Many2many` | banyak ke banyak | lewat tabel penghubung otomatis |

`One2many` dan `Many2many` tidak menambah kolom di tabel model itu. `One2many` hanya membaca balik dari `Many2one` di sisi anak; `Many2many` memakai tabel relasi terpisah.

### Operator domain

| Operator | Arti |
|---|---|
| `=` | sama (termasuk `False`, string kosong) |
| `!=` | tidak sama |
| `>`, `>=`, `<`, `<=` | pembandingan angka/tanggal |
| `in` / `not in` | daftar nilai |
| `like` / `ilike` | mengandung teks (`ilike` abaikan besar-kecil huruf) |
| `=like` / `=ilike` | pola dengan `%` dan `_` |
| `child_of` | record dan semua turunannya (dipakai untuk kategori) |
| `=?` | sama, tapi kondisi diabaikan kalau nilainya `False` |

`=?` adalah penyelamat untuk filter opsional: `("partner_id", "=?", partner_id)` menghasilkan kondisi yang dilewati saat `partner_id` bernilai `False`, tanpa perlu menyusun domain bercabang.

### Bekerja dengan recordset

```python
recs.ensure_one()              # error kalau bukan tepat satu record
recs.filtered(lambda r: r.credit_limit > 0)
recs.sorted(key="name")        # atau key=lambda r: -r.credit_limit
recs.mapped("partner_id.name") # menembus relasi
recs.exists()                  # buang record yang sudah dihapus
```

`mapped()` menembus relasi dengan titik dan mengembalikan recordset gabungan — cara termurah mengambil data terkait tanpa loop query. `filtered()` bekerja di memori: hanya pakai untuk recordset yang sudah kecil.

### Tiga cara mewarisi, tiga akibat berbeda

| Deklarasi | Arti | Tabel |
|---|---|---|
| `_inherit = 'x'` + `_name = 'y'` | perluasan model baru dari model lama | tabel baru `y` |
| `_inherit = 'x'` tanpa `_name` | menambah/mengubah model `x` | tabel `x` yang sama |
| `_inherits = {'x': 'x_id'}` | delegasi: model baru punya record `x` sendiri | tabel baru + Many2one |

Kasus paling sering di pekerjaan adalah yang kedua: menambah field ke model bawaan. Yang ketiga dipakai saat model baru secara konsep *adalah* model lama plus sesuatu.

### Field computed dan `store`

```python
total = fields.Float(compute="_compute_total", store=True)

def _compute_total(self):
    for rec in self:
        rec.total = sum(rec.line_ids.mapped("subtotal"))
```

`store=False` (default) berarti dihitung saat dibaca — selalu segar, tapi tidak bisa dipakai di domain atau diurutkan. `store=True` menyimpan hasilnya ke kolom: bisa dicari dan diurutkan, tapi harus ada `@api.depends` yang benar, kalau tidak nilainya basi.

### Performa: tiga kebiasaan yang menghemat paling banyak

1. **Saring di domain, bukan di Python.** `search([("state", "=", "done")])`, bukan `search([])` lalu `filtered`.
2. **Manfaatkan prefetch.** Odoo mengambil field yang sama untuk banyak record dalam satu query. Loop `for r in recs: r.partner_id.name` justru cepat; yang merusak prefetch adalah memanggil `search()` di dalam loop.
3. **Hitung di database.** `read_group()` dan `search_count()` menghindari memuat ribuan record hanya untuk menjumlahkan satu kolom.

### Error umum

| Pesan | Arti | Cara memperbaiki |
|---|---|---|
| `Expected singleton: res.partner(1, 2)` | Operasi yang butuh satu record dijalankan pada recordset | Tambah `ensure_one()` lalu perbaiki pemanggilnya, atau loop `for rec in self` |
| `Invalid field 'x' on model 'y'` | Field tidak ada — salah nama, atau modul belum di-*upgrade* | Cek ejaan; naikkan versi modul dan restart server |
| `The operation cannot be completed: another model requires the record` | Menghapus record yang masih dirujuk model lain | Hapus/ubah record yang merujuk, atau atur `ondelete` |
| `AccessError: You are not allowed to modify ...` | Hak akses (`ir.model.access`) belum diberikan untuk model baru | Tambahkan baris di `security/ir.model.access.csv` |
| `psycopg2.errors.NotNullViolation` | Field `required` dikirim kosong lewat `create`/`write` | Isi field itu, atau beri `default` |

### Daftar periksa sebelum menulis model baru

1. Sudah cek apakah model serupa sudah ada di Odoo — sering cukup menambah field.
2. `_name` memakai awalan yang jelas, tidak menabrak nama modul lain.
3. Setiap `Many2one` punya `ondelete` yang disengaja.
4. Field uang memakai `Monetary` + `currency_field`, bukan `Float`.
5. Ada baris hak akses di `security/` untuk model baru — tanpa itu, hanya admin bisa membukanya.
6. Penyaringan ada di domain, bukan di `filtered()` setelah `search([])`.
7. Field `store=True` punya `@api.depends` yang lengkap.
8. Tidak ada `self.env.cr.execute` kecuali benar-benar terpaksa, dan diberi komentar alasannya.

## Latihan

Latihan 1 meniru `search()` + `mapped()` dalam Python biasa, supaya bentuk domain dan penyaringan terasa wajar sebelum bertemu API aslinya. Latihan 2 membuka database Odoo sungguhan untuk melihat bahwa field relasi menyimpan id, bukan salinan data.

## Kamu sudah bisa ini kalau…

- [ ] Bisa menjelaskan kenapa `_name = "res.partner"` menghasilkan tabel `res_partner`.
- [ ] Bisa menulis domain untuk "perusahaan di Bandung dengan limit kredit di atas nol".
- [ ] Tahu beda `_inherit` dan `_inherits`, dan mana yang dipakai untuk menambah field ke model bawaan.
- [ ] Bisa menyebut dua hal yang hilang kalau menulis SQL langsung ke tabel Odoo.
- [ ] Latihan 1 lulus dan latihan 2 berhasil dijalankan.
