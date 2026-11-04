import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Panduan',
  description: 'Cara memakai Pintas: dua lapis materi, arti badge, kuis, latihan, dan progres.',
};

/** Panduan platform (F-11). Sebelas bagian wajib, urutan tetap. */
export default function HalamanPanduan() {
  return (
    <div className="modul mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold tracking-tight">Panduan</h1>

      <h2>1. Apa itu Pintas</h2>
      <p>
        Pintas mengupas satu stack teknologi menjadi modul pendek berbahasa Indonesia. Setiap modul punya
        lapis ringkas yang bisa langsung dipraktikkan dan lapis detail untuk semua parameter serta error.
      </p>
      <p>
        <strong>Yang tidak dijanjikan:</strong> tidak ada sertifikat, tidak ada penilaian otomatis untuk
        project, tidak ada jaminan pekerjaan, dan tidak ada akun. Progresmu tersimpan di browser ini saja.
      </p>

      <h2>2. Cara mulai</h2>
      <p>
        Pilih track di beranda, atau tekan <kbd>Ctrl K</kbd> lalu ketik apa yang kamu cari. Tidak ada urutan
        wajib: modul mana pun bisa dibuka kapan pun.
      </p>

      <h2>3. Cara membaca modul: lapis 1 dan lapis 2</h2>
      <p>
        <strong>Lapis 1</strong> adalah bagian utama: konsep, analogi, kode yang berjalan, output yang
        diharapkan, dan penjelasan tiap baris. Targetnya selesai dalam sekitar 10 menit.
      </p>
      <p>
        <strong>Lapis 2</strong> ada di balik blok yang bisa dibuka: semua parameter, alasan desain,
        perbandingan dengan dokumentasi resmi, dan daftar error beserta cara memperbaikinya.
      </p>

      <h2>4. Arti badge dan prasyarat</h2>
      <ul>
        <li>
          <strong>Di web</strong> — ada editor kode; kodenya dijalankan di server dan dibandingkan dengan
          output yang diharapkan.
        </li>
        <li>
          <strong>Di laptop</strong> — panduan enam langkah yang kamu kerjakan di mesin sendiri.
        </li>
        <li>
          <strong>Tanpa latihan</strong> — modul bacaan saja.
        </li>
        <li>
          <strong>Prasyarat</strong> — saran, bukan gerbang. Tidak ada modul yang terkunci.
        </li>
      </ul>

      <h2>5. Kuis dan arti skor</h2>
      <p>
        Tiga sampai lima soal per modul. Jawaban dinilai di server; skor terakhir yang disimpan, bukan riwayat
        percobaan. Kuis bisa diulang sebanyak yang kamu mau — salah tidak mengunci apa pun.
      </p>

      <h2>6. Menjalankan latihan di web</h2>
      <p>
        Tekan <em>Jalankan</em>. Kode dikirim ke server, diteruskan ke penyedia eksekusi, lalu hasilnya
        dibandingkan dengan output yang diharapkan setelah spasi di ujung baris dinormalisasi.
      </p>
      <p>
        Batasnya: 64 KB per kode, 15 detik waktu eksekusi, dan 20 permintaan per menit. Output harus sama
        persis karena tujuannya melatih ketelitian — bukan karena sistemnya kaku.
      </p>

      <h2>7. Latihan di laptop</h2>
      <p>Enam bagian baku: yang dibutuhkan, langkah, hasil yang harus muncul, cek berhasil, kalau gagal, dan buktikan kamu paham.</p>
      <p>
        Bagian <em>kalau gagal</em> memuat error nyata yang paling sering muncul — bukan daftar hipotetis.
        Kalau errormu tidak ada di situ, artinya kamu menghadapi hal baru; cari pesannya apa adanya.
      </p>

      <h2>8. Capstone dan rubrik</h2>
      <p>
        Setiap track diakhiri project. Rubriknya menyebut bobot tiap kriteria dan syarat lulus. Tidak ada
        penilaian otomatis: kamu menyimpan tautan repo di halaman project, lalu minta review manual.
      </p>

      <h2>9. Arti semua status</h2>
      <ul>
        <li>
          <strong>lulus</strong> — output sama dengan yang diharapkan.
        </li>
        <li>
          <strong>gagal</strong> — kode berjalan tanpa error, tapi outputnya beda.
        </li>
        <li>
          <strong>error</strong> — kode gagal dikompilasi/dijalankan; pesan asli compiler ditampilkan apa adanya.
        </li>
        <li>
          <strong>Segera</strong> — track yang kontennya belum ditulis.
        </li>
      </ul>

      <h2>10. Keyboard, tema, dan glosarium</h2>
      <ul>
        <li>
          <kbd>Ctrl K</kbd> atau <kbd>Cmd K</kbd> — buka pencarian. <kbd>/</kbd> juga bisa.
        </li>
        <li>
          <kbd>Esc</kbd> — tutup pencarian. <kbd>↑</kbd> <kbd>↓</kbd> — pilih hasil. <kbd>Enter</kbd> — buka.
        </li>
        <li>Tema mengikuti sistem; tombol di kanan atas untuk mengubah manual.</li>
        <li>
          <em>Token</em> — potongan teks yang dihitung model. <em>Context window</em> — batas total token.
          <em> Embedding</em> — vektor angka yang mewakili makna teks. <em>RAG</em> — mengambil dokumen dulu,
          baru menjawab.
        </li>
      </ul>

      <h2>11. Menjalankan lokal dan berkontribusi</h2>
      <p>
        Cara menjalankan di mesin sendiri dan aturan menulis modul ada di <code>README.md</code> repo. Setiap
        modul wajib punya lapis 1, lapis 2, 3–5 soal kuis, dan minimal satu latihan.
      </p>
    </div>
  );
}
