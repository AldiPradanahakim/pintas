# 01 — BRD (Business Requirement Document)

## Pintas

Dokumen ini menjelaskan **masalah dan tujuan**. Fitur tidak dibahas di sini — fitur ada di `02-PRD.md`.

| | |
|---|---|
| Nama produk | Pintas |
| Domain | `pintas.dev` (belum dibeli, tersedia saat dicek 2026-11-05) |
| Repo | `pintas-dev` (nama org GitHub belum dibuat) |
| Versi dokumen | 1.0 — 2026-11-05 |
| Status | Fiks, siap masuk Development (109) |
| Pemilik | Aldi Pradan Hakim |

---

## 1. Masalah

Dokumentasi resmi setiap bahasa dan framework sudah lengkap, tetapi:

1. **Panjang dan bercabang.** Satu halaman dokumentasi resmi sering menyuruh pembaca membuka lima halaman lain sebelum satu contoh bisa dijalankan. Untuk orang yang belajar sambil praktik, ini memutus momentum.
2. **Tidak menjelaskan "kenapa".** Dokumentasi resmi mendokumentasikan *apa* dan *bagaimana*, jarang menjelaskan *mengapa* sebuah pilihan desain diambil dan apa akibatnya kalau salah.
3. **Tidak menjelaskan alur kerja nyata.** Dokumentasi menjawab "cara membuat endpoint", bukan "di pekerjaan, endpoint ini ada di lapisan mana, siapa memanggilnya, apa yang terjadi saat gagal".
4. **Tersebar di banyak situs.** Untuk satu stack (misal Odoo), pembelajar harus berpindah antara dokumentasi Python, PostgreSQL, XML/QWeb, OWL, dan dokumentasi Odoo sendiri. Tidak ada satu tempat yang merangkai semuanya menjadi satu alur.
5. **Biaya masuk tinggi untuk orang yang tidak suka membaca teks panjang.** Pembelajar tipe praktik berhenti di tengah jalan, bukan karena materinya sulit, tapi karena bentuk penyampaiannya tidak cocok.

Akibat yang dirasakan pemilik produk: untuk masuk ke peran seperti AI & LLM Engineer, Odoo Developer, atau .NET Developer, ia harus memulai dari nol di setiap stack baru, padahal konsep dasarnya (HTTP, SQL, Git, async, testing) sama.

## 2. Tujuan

| # | Tujuan | Ukuran keberhasilan |
|---|---|---|
| G1 | Satu tempat yang merangkai seluruh stack sebuah peran kerja menjadi satu alur yang bisa diikuti | Ada track untuk tiap peran target, tiap track punya peta alur dari fondasi sampai deploy |
| G2 | Memadatkan dokumentasi resmi tanpa mengubah makna dan hasil | Setiap klaim teknis di modul bisa dilacak ke dokumentasi resmi; contoh kode di modul benar-benar berjalan dengan output yang ditulis |
| G3 | Menyediakan kedalaman sesuai kebutuhan saat itu | Setiap modul punya lapis ringkas (baca cepat) dan lapis detail (parameter, error, alasan desain) |
| G4 | Membuat pembelajar mampu mengerjakan pekerjaan tanpa mulai dari nol | Setiap track diakhiri capstone yang meniru tugas harian peran tersebut, dinilai dengan rubrik |
| G5 | Bisa dipakai tanpa urutan wajib | Semua modul bisa dibuka langsung; prasyarat hanya saran |
| G6 | Biaya operasional nol pada fase MVP | Berjalan lokal, tanpa layanan berbayar |

**Definisi berhasil untuk MVP:** track AI & LLM Engineer selesai (12–16 modul + capstone), platform berjalan lokal dengan 9 halaman, kuis dinilai otomatis, latihan web berjalan lewat Wandbox, dan pemilik produk menyatakan materinya bisa dipahami tanpa membuka dokumentasi resmi.

## 3. Pengguna dan stakeholder

| Peran | Siapa | Kebutuhan utama |
|---|---|---|
| Pembelajar utama | Pemilik produk (Aldi) | Cepat paham, bisa langsung praktik, detail tidak ada yang hilang |
| Pembelajar lain | Publik, setelah dipublikasikan | Materi yang sama, tanpa harus mengenal pemilik |
| Kontributor | Siapa pun yang membuka repo (open source) | Struktur konten yang jelas, cara menambah modul yang terdokumentasi |
| Penulis konten | Agen (Hermes) | Format modul baku, tidak perlu menyentuh kode aplikasi untuk menambah materi |
| Auditor | Topic Security Review (190) | Permukaan serang kecil, tidak ada data sensitif |

Catatan: **tidak ada peran admin, moderator, atau user terdaftar** di MVP. Tidak ada akun, tidak ada data pribadi yang disimpan.

## 4. Ruang lingkup

**Termasuk (MVP):**
- Platform web yang berjalan lokal, 9 halaman (lihat PRD).
- Konten Markdown untuk track AI & LLM Engineer (12–16 modul + capstone) dan Tier 0 fondasi.
- Kuis auto-grade, latihan kode di web, panduan latihan di laptop, capstone project dengan rubrik.
- Live search, progres lokal, panduan pemakaian platform.
- Daftar seluruh bahasa & framework beserta kegunaannya.

**Tidak termasuk (MVP):**
- Login, akun, data pribadi.
- Penilaian otomatis repo GitHub.
- Panel admin yang dapat diakses dari internet.
- Komentar, forum, sertifikat, notifikasi email.
- Hosting produksi dan domain (diputuskan setelah MVP jalan).
- Track Odoo, .NET/C#, Docker, Go, Kafka, Angular — dikerjakan setelah track pertama terbukti.

## 5. Batasan dan asumsi

| # | Batasan/asumsi | Dampak kalau salah |
|---|---|---|
| B1 | Situs berjalan di lokal pada MVP | Kalau langsung publik, wajib audit keamanan lebih ketat |
| B2 | Tanpa login, progres di localStorage | Progres hilang saat clear data / ganti browser — diterima sadar |
| B3 | Latihan web memakai Wandbox (layanan pihak ketiga) | Kalau Wandbox berhenti, latihan web mati; jalur cadangan self-host Piston |
| B4 | Latihan web hanya satu file lepas | Framework, Docker, Odoo, Kafka tidak bisa dijalankan di web — wajib latihan laptop |
| B5 | Konten adalah file Markdown di repo | Butuh editor teks + Git; tanpa panel admin yang bisa diakses dari internet |
| B6 | Volume konten 12–16 modul per track | Bisa 1 bulan per track; dipotong di track berikutnya bila terlalu berat |
| B7 | Penulis konten adalah agen, manusia hanya mereview | Kualitas bergantung pada review; wajib ada verifikasi contoh kode benar-benar jalan |
| B8 | Stack Node.js/Next.js (bukan Python) | Pemilik belum menguasai Python/Django, jadi tidak bisa merawat sendiri |

## 6. Risiko

| # | Risiko | Dampak | Mitigasi |
|---|---|---|---|
| R1 | Volume konten jauh lebih besar dari perkiraan | Track pertama tidak pernah selesai | Ukur waktu nyata modul 1, kalibrasi jumlah modul per track, bukan per track berjalan |
| R2 | Konten menyalin dokumentasi resmi tanpa nilai tambah | Produk tidak berguna | Setiap modul wajib punya bagian "kenapa" dan "di pekerjaan, ini dipakai untuk apa" |
| R3 | Contoh kode di modul tidak jalan | Kepercayaan hancur | Verifikasi: contoh yang bisa dijalankan di web wajib lulus Wandbox sebelum modul dianggap selesai |
| R4 | Layanan sandbox gratis berubah kebijakan | Latihan web mati | Abstraksi satu modul `runner`, siap self-host Piston |
| R5 | Tanpa login, tidak ada cara menghubungi pengguna | Tidak bisa memperbaiki masalah yang dialami pengguna | Disediakan tautan isu GitHub di setiap halaman |
| R6 | Proyek berhenti di tengah karena bosan menulis | Platform setengah jadi | Urutan kerja: platform jalan dulu dengan 3 modul, baru lanjut isi |

## 7. Ukuran keberhasilan (setelah publik)

| Metrik | Target awal |
|---|---|
| Track selesai | 1 (AI & LLM) sebelum memulai track kedua |
| Modul dengan contoh kode terverifikasi | 100% |
| Waktu baca lapis 1 per modul | ≤ 10 menit |
| Waktu muat halaman modul (lokal) | < 500 ms |
| Biaya operasional bulanan | Rp 0 (lokal) |

Angka di luar tabel ini (jumlah pengunjung, retensi) belum ditetapkan — `TODO: konfirmasi setelah publik`.
