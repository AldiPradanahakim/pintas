---
track: angular
nomor: 1
judul: "Komponen dan signal: keadaan yang berubah tanpa kejar-kejaran"
slug: komponen-dan-signal
estimasi_menit: 13
prasyarat:
  - fondasi/http
latihan:
  - id: angular-01-latihan-1
    jenis: web
    bahasa: python
    soal: "Hitung turunan dari keadaan keranjang: diberi daftar barang (nama, harga, jumlah), cetak 'item <n>' berisi total jumlah barang, 'subtotal <n>' berisi total harga, dan 'diskon <n>' berisi 10% dari subtotal kalau subtotal di atas 500000, selain itu 0."
    kode_awal: |-
      KERANJANG = [
          ("kabel", 45000, 2),
          ("mouse", 120000, 1),
          ("keyboard", 250000, 3),
      ]

      # item     = total jumlah barang
      # subtotal = total harga (harga x jumlah)
      # diskon   = 10% subtotal kalau subtotal > 500000, selain itu 0
    output_harapan: |-
      item 6
      subtotal 960000
      diskon 96000
    solusi: |-
      KERANJANG = [
          ("kabel", 45000, 2),
          ("mouse", 120000, 1),
          ("keyboard", 250000, 3),
      ]

      item = sum(q for _, _, q in KERANJANG)
      subtotal = sum(h * q for _, h, q in KERANJANG)
      diskon = int(subtotal * 0.1) if subtotal > 500000 else 0

      print(f"item {item}")
      print(f"subtotal {subtotal}")
      print(f"diskon {diskon}")
    catatan_solusi: "Ini tepatnya yang dilakukan computed signal di Angular: item, subtotal, dan diskon bukan keadaan terpisah yang harus diperbarui manual setiap kali isi keranjang berubah — ketiganya DITURUNKAN dari satu sumber. Kalau disimpan sebagai keadaan sendiri, ketiganya bisa jadi tidak sinkron: subtotal benar tapi diskon masih nilai lama. Satu sumber, banyak turunan, nol kemungkinan tidak sinkron."
  - id: angular-01-latihan-2
    jenis: laptop
    soal: "Buat proyek Angular, tambahkan satu komponen dengan signal dan computed, lalu buktikan bahwa computed dihitung ulang saat signal berubah — dan tidak dihitung saat tidak berubah."
    kebutuhan:
      - "Node.js 20 atau lebih baru (node --version)"
      - "Angular CLI (npm i -g @angular/cli)"
      - "Terminal (git-bash / PowerShell)"
    langkah:
      - perintah: "ng version"
        penjelasan: "Memastikan Angular CLI terpasang dan menampilkan versi Angular. Kalau perintah tidak dikenal, pasang dulu dengan npm i -g @angular/cli."
      - perintah: "ng new latihan-signal --routing=false --style=css --skip-git"
        penjelasan: "Membuat proyek baru. --routing=false menyederhanakan struktur karena modul ini belum membahas routing."
      - perintah: "cd latihan-signal && ng serve"
        penjelasan: "Menjalankan server pengembangan di http://localhost:4200. Biarkan jendela ini terbuka; setiap perubahan berkas otomatis dimuat ulang di peramban."
      - perintah: "ng generate component keranjang"
        penjelasan: "Membuat komponen keranjang di src/app/keranjang/. CLI membuat empat berkas: .ts, .html, .css, dan .spec.ts."
      - perintah: "Ubah src/app/keranjang/keranjang.ts: tambahkan signal dan computed dari blok kode di atas, lalu buka http://localhost:4200"
        penjelasan: "Komponen menampilkan item, subtotal, dan diskon. Tombol 'tambah' menaikkan jumlah barang pertama; angka item, subtotal, dan diskon berubah bersamaan tanpa kode tambahan."
      - perintah: "Buka konsol peramban, ketik document.querySelectorAll('button')[0].click() tiga kali"
        penjelasan: "Menekan tombol tiga kali lewat konsol. Perhatikan: yang berubah hanya signal sumber (jumlah), sedangkan item/subtotal/diskon ikut menyesuaikan. Tidak ada satu baris pun yang memerintahkan mereka dihitung ulang."
    hasil: |-
      item 6
      subtotal 960000
      diskon 96000
    cek_berhasil:
      - "Langkah 3: halaman terbuka tanpa galat di konsol"
      - "Langkah 5: tiga angka tampil dan konsisten satu sama lain"
      - "Langkah 6: setelah tiga klik, item naik 3 dan subtotal/diskon ikut berubah"
    kalau_gagal:
      - error: "ng: command not found"
        arti: "Angular CLI belum terpasang global, atau terminal belum dibuka ulang setelah pemasangan."
        perbaikan:
          - "npm i -g @angular/cli lalu buka terminal baru"
          - "Atau jalankan lewat npx: npx ng version"
      - error: "Error: This command is not available when running the Angular CLI outside a workspace."
        arti: "Perintah ng dijalankan di luar folder proyek."
        perbaikan:
          - "Pastikan sudah cd latihan-signal"
      - error: "NG05104: The selector \"app-keranjang\" did not match any element"
        arti: "Komponen dibuat tapi belum dipakai di template induk."
        perbaikan:
          - "Tambahkan <app-keranjang /> ke src/app/app.html"
      - error: "Property 'computed' does not exist"
        arti: "Impor dari @angular/core belum ada, atau versi Angular di bawah 16."
        perbaikan:
          - "Pastikan baris: import { Component, signal, computed } from '@angular/core';"
    buktikan:
      perubahan: "Tambahkan barang keempat ke array di signal — misalnya ('monitor', 1500000, 1) — lalu lihat halaman tanpa mengubah kode perhitungan."
      hasil_diharapkan: "item, subtotal, dan diskon semuanya berubah tanpa satu pun baris di fungsi hitung disentuh. Inilah bedanya keadaan turunan dengan keadaan yang disalin manual."
kuis:
  - tipe: pilihan_ganda
    pertanyaan: "Apa yang membuat signal berbeda dari variabel biasa di komponen Angular?"
    opsi:
      a: "Signal lebih cepat karena ditulis dalam TypeScript"
      b: "Signal memberi tahu Angular kapan nilainya berubah, sehingga tampilan bisa diperbarui tanpa pemeriksaan menyeluruh"
      c: "Signal menyimpan data di server"
      d: "Signal hanya bisa menyimpan angka"
    jawaban: b
    penjelasan: "Variabel biasa tidak memberi tahu apa pun saat nilainya berubah; Angular harus memeriksa semua binding secara berkala untuk menemukan perubahan. Signal membawa nilai sekaligus pemberitahuan perubahan, jadi Angular tahu persis bagian mana yang perlu diperbarui. Ini mengubah model dari 'periksa semuanya' menjadi 'reaksi pada yang berubah'."
    tingkat: dasar
  - tipe: pilihan_ganda
    pertanyaan: "Kapan computed dihitung ulang?"
    opsi:
      a: "Setiap kali ada klik di halaman"
      b: "Hanya saat salah satu signal yang dibacanya berubah"
      c: "Setiap detik"
      d: "Saat komponen dihapus"
    jawaban: b
    penjelasan: "Computed melacak signal apa saja yang dibaca selama perhitungan. Selama signal itu tidak berubah, hasilnya dipakai ulang dari cache — seratus kali dibaca tetap satu kali hitung. Begitu salah satunya berubah, hasil cache dibuang dan dihitung lagi saat berikutnya dibaca."
    tingkat: menengah
  - tipe: isian_singkat
    pertanyaan: "Fungsi dari @angular/core untuk membuat signal yang nilainya bisa ditulis adalah ... (satu kata)"
    jawaban: "signal"
    penjelasan: "signal(nilaiAwal) membuat signal yang bisa dibaca dengan memanggilnya (s().length) dan diubah dengan .set() atau .update(). Lawannya computed, yang hanya bisa dibaca — dan justru itu yang membuatnya aman: tidak ada jalan bagi kode lain untuk menimpa hasil turunan."
    tingkat: dasar
  - tipe: pilihan_ganda
    pertanyaan: "Kenapa menyimpan subtotal sebagai signal yang ditulis manual berbahaya?"
    opsi:
      a: "Karena signal mahal"
      b: "Karena mudah lupa memperbaruinya, sehingga subtotal dan isi keranjang bisa tidak cocok"
      c: "Karena Angular melarangnya"
      d: "Karena membuat tampilan lambat"
    jawaban: b
    penjelasan: "Dua sumber kebenaran selalu bisa berbeda. Kalau isi keranjang dan subtotal sama-sama signal tulis, setiap tempat yang mengubah keranjang wajib ingat memperbarui subtotal — dan satu tempat yang lupa sudah cukup untuk menampilkan angka salah ke pengguna. Computed menghapus kemungkinan itu sepenuhnya."
    tingkat: menengah
  - tipe: isian_singkat
    pertanyaan: "Subtotal 960000 dengan diskon 10%. Berapa nilai diskonnya? (tulis angkanya saja)"
    jawaban: "96000"
    penjelasan: "960000 × 0,1 = 96.000. Perhatikan urutan: diskon dihitung dari subtotal SEBELUM pajak, dan hanya berlaku kalau subtotal melewati ambang. Menaruh ambang setelah diskon diterapkan akan menghasilkan keputusan yang berbeda di sekitar batas — kasus tepi yang sering jadi bug di halaman checkout."
    tingkat: dasar
---

## Lapis 1

### Masalah yang signal pecahkan

Komponen punya data, dan data itu berubah. Pertanyaan yang harus dijawab Angular: **bagian mana tampilan yang perlu diperbarui?**

Cara lama: periksa semuanya secara berkala. Setiap binding dievaluasi ulang, dibandingkan dengan nilai sebelumnya, dan kalau berbeda, DOM diperbarui. Dengan aplikasi kecil, tidak terasa. Dengan ratusan komponen, pekerjaan itu menumpuk.

Signal mengubah pendekatannya: **nilai memberi tahu kapan ia berubah.** Angular tidak perlu menebak.

```ts
const jumlah = signal(0);        // bisa ditulis
jumlah.set(5);                   // Angular tahu: ini berubah
jumlah.update((n) => n + 1);     // ubah berdasarkan nilai lama
```

Membaca nilainya dengan memanggilnya: `jumlah()`.

### Computed: turunan, bukan salinan

Inilah bagian yang paling berguna.

```ts
const harga = signal(45000);
const jumlah = signal(2);

const subtotal = computed(() => harga() * jumlah());
```

`subtotal` tidak disimpan sebagai keadaan. Ia **dihitung dari** keadaan lain. Setiap kali `harga` atau `jumlah` berubah, `subtotal` ikut berubah — tanpa satu baris pun yang memerintahkannya.

Bedanya penting:

| Cara | Risiko |
|---|---|
| Signal terpisah, diperbarui manual | Bisa lupa, bisa tidak sinkron |
| Computed | Tidak mungkin tidak sinkron |

Aturan yang bisa dipegang: **kalau sebuah nilai bisa dihitung dari nilai lain, jangan simpan sebagai keadaan.**

### Computed itu malas dan di-cache

Computed tidak dihitung setiap kali dibaca. Ia menghitung sekali, menyimpan hasilnya, dan memakai ulang selama signal yang dibacanya tidak berubah.

```ts
const mahal = computed(() => {
  console.log('dihitung');
  return daftar().filter(x => x.aktif).length;
});
```

Baca `mahal()` sepuluh kali tanpa mengubah `daftar` → `'dihitung'` muncul **sekali**. Ubah `daftar` sekali → muncul sekali lagi saat berikutnya dibaca.

Karena itu jangan menaruh efek samping di dalam computed (memanggil API, menulis localStorage). Computed bisa tidak dijalankan sama sekali kalau hasilnya tidak pernah dibaca.

### Efek: untuk hal di luar tampilan

Kalau kamu perlu *melakukan* sesuatu saat signal berubah — menyimpan ke localStorage, mencatat ke analytics — itu tugas `effect`, bukan `computed`.

```ts
effect(() => {
  localStorage.setItem('tema', tema());
});
```

Aturan: **computed untuk nilai, effect untuk tindakan.** Mencampur keduanya menghasilkan siklus yang sulit dilacak.

### Template membaca signal, bukan properti

```html
<p>Item: {{ item() }}</p>
<p>Subtotal: {{ subtotal() | currency:'IDR' }}</p>
<button (click)="tambah()">Tambah</button>
```

Tanda kurung setelah nama bukan salah tulis — itu cara memanggil signal. Tanpa kurung, yang tampil adalah fungsi, bukan nilainya.

## Lapis 2

### Komponen dengan signal lengkap

```ts
import { Component, computed, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';

interface Barang {
  nama: string;
  harga: number;
  jumlah: number;
}

@Component({
  selector: 'app-keranjang',
  imports: [CurrencyPipe],
  template: `
    <ul>
      @for (b of keranjang(); track b.nama) {
        <li>
          {{ b.nama }} — {{ b.jumlah }} × {{ b.harga | currency:'IDR' }}
          <button (click)="tambah(b.nama)">+</button>
        </li>
      }
    </ul>

    <p>Item: {{ item() }}</p>
    <p>Subtotal: {{ subtotal() | currency:'IDR' }}</p>
    <p>Diskon: {{ diskon() | currency:'IDR' }}</p>
    <p><strong>Total: {{ total() | currency:'IDR' }}</strong></p>
  `,
})
export class Keranjang {
  readonly keranjang = signal<Barang[]>([
    { nama: 'kabel', harga: 45000, jumlah: 2 },
    { nama: 'mouse', harga: 120000, jumlah: 1 },
    { nama: 'keyboard', harga: 250000, jumlah: 3 },
  ]);

  readonly item = computed(() => this.keranjang().reduce((n, b) => n + b.jumlah, 0));

  readonly subtotal = computed(() =>
    this.keranjang().reduce((n, b) => n + b.harga * b.jumlah, 0),
  );

  readonly diskon = computed(() => (this.subtotal() > 500_000 ? this.subtotal() * 0.1 : 0));

  readonly total = computed(() => this.subtotal() - this.diskon());

  tambah(nama: string) {
    // update, bukan mutate: array baru supaya signal tahu ada perubahan
    this.keranjang.update((daftar) =>
      daftar.map((b) => (b.nama === nama ? { ...b, jumlah: b.jumlah + 1 } : b)),
    );
  }
}
```

Tiga hal yang menentukan benar atau tidaknya kode ini:

**`readonly` pada signal.** Signal-nya sendiri tidak pernah diganti — hanya isinya yang diubah lewat `set`/`update`. Menandai `readonly` mencegah kode lain menimpa seluruh signal.

**`computed` bertingkat.** `diskon` membaca `subtotal`, dan `total` membaca keduanya. Rantai ini bekerja otomatis: ubah satu barang, dan `item`, `subtotal`, `diskon`, `total` semuanya segar.

**`update` menghasilkan array baru.** Kalau kamu menulis `this.keranjang().push(b)`, kamu mengubah array yang sama — dan sebuah signal tidak tahu isinya berubah karena referensinya tidak berubah. Hasilnya tampilan tidak diperbarui, dan bug ini sangat membingungkan.

### Objek vs array: kenapa referensi menentukan

Signal membandingkan dengan `===`. Untuk nilai primitif (angka, string), itu cukup. Untuk objek dan array, `===` membandingkan **referensi**, bukan isi.

```ts
const a = [1, 2];
a.push(3);
a === a;  // true — referensi sama, isi berubah

keranjang.set(a);  // Angular tidak melihat perubahan
```

Karena itu:

```ts
keranjang.update((d) => [...d, barangBaru]);   // ✅ array baru
keranjang.update((d) => { d.push(barangBaru); return d; }); // ❌ referensi sama
```

Untuk objek bersarang, buat salinan di setiap tingkat yang berubah:

```ts
this.pengguna.update((p) => ({ ...p, alamat: { ...p.alamat, kota: 'Bandung' } }));
```

### Signal turunan dari input

Komponen anak menerima data lewat `input()`, dan bisa punya computed di atasnya:

```ts
import { Component, computed, input } from '@angular/core';

@Component({ selector: 'app-baris', template: `<p>{{ totalBaris() }}</p>` })
export class Baris {
  readonly barang = input.required<Barang>();

  readonly totalBaris = computed(() => this.barang().harga * this.barang().jumlah);
}
```

`input()` menghasilkan signal — jadi ia bisa dibaca di computed, dilacak, dan tidak perlu `ngOnChanges` sama sekali. Perubahan dari induk mengalir otomatis.

### derived state vs effect: contoh nyata

**Kasus A — nilai untuk ditampilkan.** Pakai `computed`.

```ts
readonly labelTombol = computed(() => (this.keranjang().length ? 'Bayar' : 'Keranjang kosong'));
```

**Kasus B — tindakan saat berubah.** Pakai `effect`.

```ts
constructor() {
  effect(() => {
    localStorage.setItem('keranjang', JSON.stringify(this.keranjang()));
  });
}
```

Kalau Kasus B ditulis sebagai computed, penyimpanan hanya terjadi ketika hasilnya kebetulan dibaca — dan bisa tidak pernah terjadi.

### Kesalahan yang paling sering

**Mutasi array/objek.** Sudah dibahas: tampilan tidak berubah, dan penyebabnya tidak terlihat dari kode.

**Menghitung di template.** `{{ daftar().filter(x => x.aktif).length }}` berjalan setiap kali template dievaluasi. Dengan daftar besar, ini lambat. Pindahkan ke `computed`.

**Effect untuk menyalin signal.** `effect(() => this.salinan.set(this.sumber()))` — ini computed yang ditulis dengan cara yang lebih buruk: ada jeda satu putaran, dan bisa berputar tanpa henti kalau ada siklus.

**Membaca signal di luar konteks reaktif.** Kode di `setTimeout` atau callback pihak ketiga yang membaca signal tidak membuat Angular tahu apa pun. Bungkus dengan `untracked()` kalau memang hanya butuh nilainya sekali.

### Daftar periksa

1. Keadaan yang bisa dihitung tidak disimpan sebagai signal tulis.
2. Semua perubahan array/objek menghasilkan referensi baru.
3. Computed tidak memuat efek samping.
4. Effect hanya untuk tindakan, bukan untuk menyalin nilai.
5. Signal ditandai `readonly` bila tidak dimaksudkan untuk diganti dari luar.
6. Perhitungan berat ada di `computed`, bukan di template.
7. Input komponen memakai `input()` sehingga bisa dipakai di computed.
