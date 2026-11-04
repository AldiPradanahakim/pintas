/**
 * Normalisasi & penilaian jawaban kuis. Fungsi murni, tanpa DB — supaya bisa diuji
 * langsung tanpa server (vitest).
 */

/**
 * Aturan dari docs/08-api.md § 5:
 * trim → lowercase → rapatkan spasi beruntun → buang `;` dan `.` di ujung.
 * Tidak ada pencocokan fuzzy: "select" bukan jawaban untuk "selec".
 */
export function normalisasiIsian(teks: string): string {
  return teks
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[.;]+$/, '')
    .trim();
}

/** Kunci pilihan ganda: huruf kecil, satu karakter a–d. Huruf lain = salah, bukan error. */
export function normalisasiPilihan(teks: string): string {
  return teks.trim().toLowerCase().slice(0, 1);
}

export interface HasilNilai {
  benar: boolean;
  jawaban_benar: string;
}

export function nilaiJawaban(
  soal: { tipe: string; jawaban: string },
  jawabanPengguna: string,
): HasilNilai {
  const benar =
    soal.tipe === 'pilihan_ganda'
      ? normalisasiPilihan(jawabanPengguna) === normalisasiPilihan(soal.jawaban)
      : normalisasiIsian(jawabanPengguna) === normalisasiIsian(soal.jawaban);

  return { benar, jawaban_benar: soal.jawaban };
}

/**
 * Normalisasi output latihan (docs/08-api.md § 6.1):
 * \r\n → \n, trim spasi/tab di ujung tiap baris, buang baris kosong di akhir.
 */
export function normalisasiOutput(teks: string): string {
  return teks
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((b) => b.replace(/[ \t]+$/, ''))
    .join('\n')
    .replace(/\n+$/, '');
}
